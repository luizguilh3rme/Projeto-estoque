import { useEffect, useState } from "react"
import { Container } from "../../components/container"
import { useParams } from "react-router-dom"

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

  useEffect(() => {
    async function loadRot(){
      if(!id){return} //se não tiver nenhum id da imagem na rota ela não vai funcionar e retorna para o início

      const docRef = doc(db, "rots", id)
      getDoc(docRef)
      .then((snapshot) => {
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
      <h1>SLIDER</h1>

      {rot && (
        <main className="w-full bg-white rounded-lg p-6 my-4">
          <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
            <h1 className="font-bold text-3xl text-black">Modelo: {rot?.model}</h1>
            <h1 className="font-bold text-3xl text-black">Preço: R${rot?.price}</h1>
          </div>
          <div className="flex w-full gap-6  my-4">
            <div className="flex flex-col gap-4">
              <div>
              <p>Fabricante</p>
              <strong>{rot?.fabricante}</strong>
            </div>
            <div>
              <p>Mac</p>
              <strong>{rot?.mac}</strong>
            </div>
            <div>
              <p>Número de série</p>
              <strong>{rot?.NumeroSerie}</strong>
            </div>
            </div>
          </div>        
        </main>
      )}
    </Container>
  )
}

