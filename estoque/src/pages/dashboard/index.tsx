import {useEffect, useState, useContext} from 'react'
import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/panelheader";

import { FiTrash2 } from "react-icons/fi";

import { collection, getDocs, where, query, doc, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../../services/firebaseConnection';
import {ref, deleteObject} from 'firebase/storage';
import { AuthContext } from '../../contexts/AuthContext';

interface RotProps{
  id: string;
  model: string;
  data: string;
  mac: string;
  uid: string;
  price: string | number;
  fabricante: string;
  NumeroSerie: string;
  images: ImageRotProps[];  
}

interface ImageRotProps{
  name: string;
  uid: string;
  url: string;
}

export function Dashboard() {
  const [rots, setRots] = useState<RotProps[]>([]);
  const {user} = useContext(AuthContext);

  useEffect (() => {
      function loadRots(){
        if(!user?.uid){
          return;
        }
         
        const rotsRef = collection(db, "rots")
        const queryRef = query(rotsRef, where("uid", "==", user.uid))
  
        getDocs(queryRef)
        .then((snapshot) => {
          let listrots = [] as RotProps[];
  
          snapshot.forEach(doc => {
            listrots.push({
              id: doc.id,
              model: doc.data().model,
              data: doc.data().data,
              mac: doc.data().mac,
              price: doc.data().price,
              fabricante: doc.data().fabricante,
              NumeroSerie: doc.data().NumeroSerie,
              images: doc.data().images,
              uid: doc.data().uid
            })
          })
  
          setRots(listrots);
            
        })
      }
  
      loadRots();
    }, [user]) 

    async function handleDeleteRot(rot: RotProps){
      const itemRot = rot;

      const docRef = doc(db, "rots", itemRot.id)
      await deleteDoc(docRef); //delete do banco de dados

      itemRot.images.map( async (image) => { //função para percorrer ate a imagem
        const imagePath = `images/${image.uid}/${image.name}` //esse é o caminho montando para excluir a imagem
        const imageRef = ref (storage, imagePath)

        try{
          await deleteObject(imageRef) //percorre o banco ate deletar todas as imagens selecionadas
          setRots(rots.filter(rot => rot.id !== itemRot.id))
          
        } catch(err){
          alert("Erro ao excluir essa imagem!")
        }
      })

    }

  return (
    <Container>
      <DashboardHeader/>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rots.map( rot => (
          <section key={rot.id} className="w-full bg-white rounded-lg relative">

        <button 
        onClick={() => handleDeleteRot(rot)}
        className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow">
          <FiTrash2 size={26} color="#000"/>
        </button>
          
        <img className="w-full rounded-lg max-h-72 mb-2 "
        src={rot.images[0].url} alt="" 
        />
        <p className="font-bold mt-1 px-2 mb-2">{rot.model}</p>
        <div className="flex flex-col px-2">
          <span className="text-zinc-700">
            Mac: {rot.mac}
          </span>
          <strong className="text-black font-bold">
            R$ {rot.price}
          </strong>
        </div>

         <div className="w-full  h-px bg-slate-200 my-2"></div>
         <div className="px-2 pb-2">
          <span className="text-black">
            Data: {rot.data}
          </span>
         </div>

        </section>
        ))}
      </main>
    </Container>
  )
}

