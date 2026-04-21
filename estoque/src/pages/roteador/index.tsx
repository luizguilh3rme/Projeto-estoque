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
          <div className="w-full max-w-2xl mx-auto bg-white rounded-lg p-4">

  {/* Linha 1 */}
  <div className="grid grid-cols-2 gap-6 text-center mb-4">
    <div>
      <p className="text-gray-500 text-sm">PREÇO</p>
      <strong className="text-lg">R$ {rot?.price}</strong>
    </div>

    <div>
      <p className="text-gray-500 text-sm">FABRICANTE</p>
      <strong className="text-lg">{rot?.fabricante}</strong>
    </div>
  </div>

  {/* Linha 2 */}
  <div className="grid grid-cols-2 gap-6 text-center">
    <div>
      <p className="text-gray-500 text-sm">MAC</p>
      <strong className="text-lg break-words">{rot?.mac}</strong>
    </div>

    <div>
      <p className="text-gray-500 text-sm">NÚMERO DE SÉRIE</p>
      <strong className="text-lg break-words">{rot?.NumeroSerie}</strong>
    </div>
  </div>

</div>

            <Link key="" to={`/home`}>
            <button className="btn-back">
              Voltar
            </button>
            </Link>

            
          </div>
        </main>
      )}
    </Container>
  )
}

