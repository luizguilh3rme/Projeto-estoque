import { useEffect, useState } from "react"
import { Container } from "../../components/container"
import { useNavigate, useParams } from "react-router-dom"
import { Link } from 'react-router-dom';
import './index.css'

import { getDoc, doc } from "firebase/firestore"
import { db } from "../../services/firebaseConnection"

interface RotProps{
  id: string;
  model: string;
  data: string;
  mac: string;
  uid: string;
  price: string | number;
  fabricante: string;
  NumeroSerie: string;
  created: string;
  owner: string;
  images: ImagesRotProps[];  
}

interface ImagesRotProps{
  name: string;
  uid: string;
  url: string;
}

export function RoteadorDetail() {
  const {id} = useParams();
  const [rot, setRot] = useState<RotProps>()
  const navigate = useNavigate();

  useEffect(() => {
    async function loadRot(){
      if(!id){return} //se não tiver nenhum id da imagem na rota ela não vai funcionar e retorna para o início

      const docRef = doc(db, "rots", id)
      getDoc(docRef)
      .then((snapshot) => {

        if(!snapshot.data()){
          navigate("/")
        }

        setRot({
          id: snapshot.id,
          model: snapshot.data()?.model,
          data: snapshot.data()?.data,
          mac: snapshot.data()?.mac,
          uid: snapshot.data()?.uid,
          price: snapshot.data()?.price,
          fabricante: snapshot.data()?.fabricante,
          NumeroSerie: snapshot.data()?.NumeroSerie,
          created: snapshot.data()?.created,
          owner: snapshot.data()?.owner,
          images: snapshot.data()?.images
        })
      })
    }
    loadRot()
  }, [id])

  return (
    <Container>

      {rot && (
        <main className="main">
          <div className="main-slider bg-white rounded-lg p-6 my-4">
          <div className="flex flex-col sm:flex-row mb-8 items-center justify-center">
            <h1 className="font-bold text-3xl text-black">MODELO: {rot?.model}</h1>
          </div>
          <div className="flex w-full gap-6  my-4">
            <div className="flex flex-col gap-4">
              <div>
              <p>PREÇO:</p>
              <strong>R$ {rot?.price}</strong>
            </div>
              <div>
              <p>FABRICANTE:</p>
              <strong>{rot?.fabricante}</strong>
            </div>
            <div>
              <p>MAC:</p>
              <strong>{rot?.mac}</strong>
            </div>
            <div>
              <p>NÚMERO DE SÉRIE:</p>
              <strong>{rot?.NumeroSerie}</strong>
            </div>

            <Link key="" to={`/home`}>
            <button className="btn-back">
              Voltar
            </button>
            </Link>

            </div>
          </div>        
          </div>
        </main>
      )}
    </Container>
  )
}

