import { useEffect, useState } from "react"
import { Container } from "../../components/container"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { Link } from 'react-router-dom'
import './index.css'

import { getDoc, doc, updateDoc } from "firebase/firestore"
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
  cliente?: string; // ✅ NOVO CAMPO
  images: ImagesRotProps[];  
}

interface ImagesRotProps{
  name: string;
  uid: string;
  url: string;
}

export function RoteadorDetail() {

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [rot, setRot] = useState<RotProps>()
  const [cliente, setCliente] = useState("")

  // 🔥 verifica se está em modo edição
  const isEdit = new URLSearchParams(location.search).get("edit");

  // 🔄 carregar dados do roteador
  useEffect(() => {
    async function loadRot(){
      if(!id) return;

      const docRef = doc(db, "rots", id)
      const snapshot = await getDoc(docRef)

      if(!snapshot.data()){
        navigate("/home")
        return;
      }

      

      const rotData: RotProps = {
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
          images: snapshot.data()?.images,
        cliente: snapshot.data()?.cliente, // ✅ pega cliente
      }

      setRot(rotData)
    }

    loadRot()
  }, [id, navigate])

  // 🔄 quando carregar o rot, preenche o input
  useEffect(() => {
    if (rot) {
      setCliente(rot.cliente || "")
    }
  }, [rot])

  // 💾 salvar cliente
  async function handleSaveCliente() {
    if (!id) return;

    const docRef = doc(db, "rots", id)

    await updateDoc(docRef, {
      cliente: cliente.toUpperCase(),
      cliente_lower: cliente.toLowerCase()
    })

    alert("Cliente salvo!")

    // atualiza tela
    setRot(prev => prev ? { ...prev, cliente } : prev)
  }

  return (
    <Container>

      {/* 🔥 MODO EDIÇÃO */}
      {isEdit && (
        <div className="bg-white p-4 rounded-lg mb-4">
          <input
            value={cliente}
            onChange={(e) => setCliente(e.target.value.toUpperCase())}
            placeholder="Nome do cliente"
            className="border-2 rounded px-3 py-2 w-full"
          />

          <button
            onClick={handleSaveCliente}
            className="bg-green-500 mt-2 px-4 py-2 rounded text-white"
          >
            Salvar
          </button>
        </div>
      )}

      {rot && (
        <main className="main">
          <div className="main-slider bg-white rounded-lg p-6 my-4">

            <div className="flex flex-col sm:flex-row mb-8 items-center justify-center">
              <h1 className="font-bold text-3xl text-black">
                MODELO: {rot.model}
              </h1>
            </div>

            <div className="w-full max-w-2xl mx-auto bg-white rounded-lg p-4">

              {/* Linha 1 */}
              <div className="grid grid-cols-2 gap-6 text-center mb-4">
                <div>
                  <p className="text-gray-500 text-sm">PREÇO</p>
                  <strong className="text-lg">R$ {rot.price}</strong>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">FABRICANTE</p>
                  <strong className="text-lg">{rot.fabricante}</strong>
                </div>
              </div>

              {/* Linha 2 */}
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <p className="text-gray-500 text-sm">MAC</p>
                  <strong className="text-lg break-words">{rot.mac}</strong>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">NÚMERO DE SÉRIE</p>
                  <strong className="text-lg break-words">{rot.NumeroSerie}</strong>
                </div>
              </div>

              {/* 👇 MOSTRAR CLIENTE */}
              <div className="text-center mt-6">
                <p className="text-gray-500 text-sm">CLIENTE</p>
                <strong className="text-lg text-green-600">
                  {rot.cliente ? rot.cliente : "Disponível"}
                </strong>
              </div>

            </div>

            <Link to={`/home`}>
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