import type { ChangeEvent } from "react"
import { useState, useContext } from "react"
import { Container } from "../../../components/container"
import { DashboardHeader } from "../../../components/panelheader"

import {FiUpload} from 'react-icons/fi'
import {useForm} from 'react-hook-form'
import {Input} from '../../../components/input'
import {z} from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthContext } from '../../../contexts/AuthContext'
import {v4 as uuidV4} from 'uuid'

import  {storage} from '../../../services/firebaseConnection'
import {ref, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage'

const schema = z.object({
  model: z.string().nonempty("O campo modelo é obrigatório"),
  fabricante: z.string().nonempty("O campo fabricante é obrigatório"),
  mac: z.string().nonempty("O mac é obrigatório"),
  numeroSerie: z.string().nonempty("O número de série é obrigatório"),
  data: z.string().nonempty("O modelo é obrigatório"),
  price: z.string().nonempty("O preço é obrigatório"),
  //whatsapp: z.string().min(1, "O telefone é obrigatório").refine((value) => /^(\d{10,11})$/.test(value), {
  //message: "Número de telefone inválido"})
})

type FormData = z.infer<typeof schema>;

export function New() {
  const {user} = useContext(AuthContext);
  const {register, handleSubmit, formState: {errors}, reset } = useForm<FormData>({
    resolver:  zodResolver(schema),
    mode: "onChange"
  })


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
        console.log("URL DE ACESSO DA FOTO", DownloadURL);
      })
    })
  }


  function onSubmit(data: FormData){
    console.log(data);
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
            <Input
            type="text"
            register={register}
            name="mac"
            error={errors.mac?.message}
            placeholder="Ex: ue38hf47ue28..."
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Número de série</p> 
            <Input
            type="text"
            register={register}
            name="numeroSerie"
            error={errors.numeroSerie?.message}
            placeholder="Ex: NSDW475he34g2..."
            />
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

