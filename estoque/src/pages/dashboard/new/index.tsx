import type { ChangeEvent } from "react"
import { useState, useContext } from "react"
import { Container } from "../../../components/container"
import { DashboardHeader } from "../../../components/panelheader"

import {FiUpload, FiTrash} from 'react-icons/fi'
import {useForm} from 'react-hook-form'
import {Input} from '../../../components/input'
import {z} from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthContext } from '../../../contexts/AuthContext'
import {v4 as uuidV4} from 'uuid'
import toast from "react-hot-toast"

import  {storage, db } from '../../../services/firebaseConnection'
import {ref, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage'
import {addDoc, collection} from 'firebase/firestore'

const schema = z.object({
  model: z.string().nonempty("O campo modelo é obrigatório"),
  fabricante: z.string().nonempty("O campo fabricante é obrigatório"),
  mac: z.string().nonempty("Informe pelo menos um MAC"),
  NumeroSerie: z.string().nonempty("Informe pelo menos um número de série"),
  data: z.string().nonempty("O modelo é obrigatório"),
  price: z.string().nonempty("O preço é obrigatório"),
  //whatsapp: z.string().min(1, "O telefone é obrigatório").refine((value) => /^(\d{10,11})$/.test(value), {
  //message: "Número de telefone inválido"})
})

type FormData = z.infer<typeof schema>;

interface ImageItemProps{
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
}

export function New() {
  const {user} = useContext(AuthContext);
  const {register, handleSubmit, formState: {errors}, reset } = useForm<FormData>({
    resolver:  zodResolver(schema),
    mode: "onChange"
  })

  const [rotImages, setRotImages] = useState<ImageItemProps[]>([])


  async function handleFile( e: ChangeEvent<HTMLInputElement>){
      if(e.target.files && e.target.files[0]){
        const image = e.target.files[0]

        if(image.type === 'image/jpeg' || image.type === 'image/png'){
          //Tipo de imagem para enviar para o banco...
          await handleUpload(image)

        }else{
      
        alert("Enviar uma imagem jpeg ou png!")
        return;
      }
    }
  }

  //conexão com o banco de dados para importar imagens
  async function handleUpload(image: File){
    if(!user?.uid){
      return;
    }

    const currentUid = user?.uid;
    const uidImage = uuidV4();

    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)

    uploadBytes(uploadRef, image)
    .then((snapshot) => {
      getDownloadURL(snapshot.ref).then((DownloadURL) => {
        const imageItem = {
          name: uidImage,
          uid: currentUid,
          previewUrl: URL.createObjectURL(image), //Esse é um preview que aparece da imagem quando selecionada, "um clone" da imagem original
          url: DownloadURL, //Esse é a imagem original que esta no banco de dados
        }

        setRotImages((images) => [...images,imageItem])
        toast.success("Imagem cadastrada com sucesso!")
      })
    })
  }


  async function onSubmit(data: FormData){

  if(rotImages.length === 0){
    toast.error("Envie pelo menos 1 imagem!")
    return;
  }

  const macList = data.mac
    .split('\n')
    .map(mac => mac.trim().toUpperCase())
    .filter(mac => mac !== "");

  const serialList = data.NumeroSerie
    .split('\n')
    .map(serial => serial.trim().toUpperCase())
    .filter(serial => serial !== "");

  if(macList.length !== serialList.length){
    toast.error("Quantidade de MACs e números de série não coincide!");
    return;
  }

  const rotListImages = rotImages.map(rot => ({
    uid: rot.uid,
    name: rot.name,
    url: rot.url
  }));

  try {

    const promises = macList.map((mac, index) => {
      return addDoc(collection(db, "rots"), {
        model: data.model.toUpperCase(),
        fabricante: data.fabricante.toUpperCase(),
        mac: mac,
        NumeroSerie: serialList[index],
        data: data.data,
        price: data.price,
        created: new Date(),
        owner: user?.name,
        uid: user?.uid,
        images: rotListImages,
      });
    });

    await Promise.all(promises);

    reset();
    setRotImages([]);
    toast.success(`${macList.length} equipamentos cadastrados com sucesso!`);

  } catch (error) {
    console.log(error);
    toast.error("Erro ao cadastrar em lote");
  }
}

  async function handleDeleteImage(item: ImageItemProps){
    const imagePath = `images/${item.uid}/${item.name}`; //Esse é o diretório para ir no fire base apagar a imagem quando clicar no botão delete
    
    const imageRef = ref(storage, imagePath);

    try{
      await deleteObject(imageRef)
      setRotImages(rotImages.filter((rot) => rot.url !== item.url))
    } catch(err){
      console.log("Erro ao deletar")
    }
  
  }

  return (
    <Container>
      <DashboardHeader/>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">  
            <FiUpload size={30} color="#000"/>
          </div>
          <div className="cursor-pointer">
            <input type="file" accept="image/*" className="opacity-0 cursor-pointer" onChange={handleFile} />
          </div>
        </button>

        {rotImages.map( item => (
          <div key={item.name} className="w-full h-32 flex items-center justify-center relative">
            <button className="absolute" onClick={() => handleDeleteImage(item)} >
            <FiTrash size={28} color="#FFF"/>
            </button>
            <img src={item.previewUrl}
            className="rounded-lg w-full  h-32 object-cover" 
            alt="Foto do equipamento" />
          </div>
        ))}
      </div>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mb-2 font-medium">Modelo do equipamento</p>
            <Input
            type="text"
            register={register}
            name="model"
            error={errors.model?.message}
            placeholder="Ex: ONT 121 AC..."
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Fabricante</p>
            <Input
            type="text"
            register={register}
            name="fabricante"
            error={errors.fabricante?.message}
            placeholder="Ex: Eurotech..."
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Mac</p>

            <textarea
            {...register("mac")}
            className="w-full border rounded-md p-2"
            placeholder="Cole todos os MACs (um por linha)"
            ></textarea>
          <p className="text-red-500 text-sm">{errors.mac?.message}</p>

          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Número de série</p> 
            <textarea
              {...register("NumeroSerie")}
              className="w-full border rounded-md p-2"
              placeholder="Cole todos os números de série (um por linha)"
            ></textarea>
            <p className="text-red-500 text-sm">{errors.NumeroSerie?.message}</p>

          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
            <p className="mb-2 font-medium">Data</p>
            <Input
            type="text"
            register={register}
            name="data"
            error={errors.data?.message}
            placeholder="Ex: 12/12/2026..."
            />
          </div>

          <div className="w-full">
            <p className="mb-2 font-medium">Preço</p>
            <Input
            type="text"
            register={register}
            name="price"
            error={errors.price?.message}
            placeholder="Ex: 350.00..."
            />
          </div>
          </div>

          <button type="submit" className="w-full rounded-md bg-zinc-900 text-white font-medium h-10  ">
            Cadastrar
          </button>

        </form>
      </div>
    </Container>
  )
}

