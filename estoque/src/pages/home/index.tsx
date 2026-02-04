import {useState, useEffect} from 'react'
import { Container } from "../../components/container";
import { Link } from 'react-router-dom';

import {collection, query, getDocs, orderBy} from 'firebase/firestore'
import { db } from '../../services/firebaseConnection'

interface RotsProps{
  id: string;
  model: string;
  data: string;
  mac: string;
  uid: string;
  price: string | number;
  fabricante: string;
  NumeroSerie: string;
  images: RotImageProps[];  
}

interface RotImageProps{
  name: string;
  uid: string;
  url: string;
}

export function Home() {
  const [rots, setRots] = useState<RotsProps[]>([])
  
  useEffect (() => {
    function loadRots(){
      const rotsRef = collection(db, "rots")
      const queryRef = query(rotsRef, orderBy("created", "desc"))

      getDocs(queryRef)
      .then((snapshot) => {
        let listrots = [] as RotsProps[];

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
  }, [])

  return (
    <Container>
      <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
        <input 
        className="w-full border-2 rounded-lg h-9 px-3 outline-none"
        placeholder="Digite o nome do roteador aqui..." />

        <button className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium text-lg">
          Buscar
        </button>
      </section>

      <h1 className="font-bold text-center mt-6 text-2xl mb-4">
        Roteadores, Onus e ONTs
      </h1>

      
      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {rots.map(rot => (
          // A section é referente a cada item do roteador 
          <Link key={rot.id} to={`/rot/${rot.id}`}>
          <section className="w-full bg-white rounded-lg">
          <img
          className="w-full rounded-lg max-h-72 mb-2  hover:scale-105 transition-all" 
          src={rot.images[0].url} 
          alt="Roteador" />
          <p className="font-bold mt-1 mb-2 px-2">{rot.model}</p>

          <div className="flex flex-col px-2">
            <span className="text-zinc-700 mb-6">{rot.data}</span>
            <strong className="text-black font-medium text-xl">{rot.mac}</strong>
            <strong className="text-black font-medium text-xl">{rot.NumeroSerie}</strong>
            <strong className="text-black font-medium text-xl">{rot.fabricante}</strong>
          </div>

          <div className="w-full h-px bg-slate-200 my-2"></div>
    
          <div className="px-2 pb-2">
            <span className="text-black">
              {rot.price}
            </span>
          </div>

        </section>
          </Link>
        ))}
        

      </main>
    </Container>
  )
}

