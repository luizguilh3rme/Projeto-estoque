import { useEffect, useState, useContext } from 'react'
import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/panelheader";

import { FiTrash2 } from "react-icons/fi";

import { collection, getDocs, where, query, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConnection';
import { AuthContext } from '../../contexts/AuthContext';

interface RotProps {
  id: string;
  model: string;
  data: string;
  mac: string;
  uid: string;
  price: string | number;
  fabricante: string;
  NumeroSerie: string;
  cliente?: string;
  images: ImageRotProps[];
}

interface ImageRotProps {
  name: string;
  uid: string;
  url: string;
}

export function Dashboard() {
  const [rots, setRots] = useState<RotProps[]>([]);
  const { user } = useContext(AuthContext);

  // Buscar equipamentos
  const [search, setSearch] = useState("");

  const filteredRots = rots.filter(rot => {
  const value = search.toUpperCase();

  return (
    rot.mac?.toUpperCase().includes(value) ||
    rot.NumeroSerie?.toUpperCase().includes(value) ||
    rot.model?.toUpperCase().includes(value) ||
    rot.cliente?.toUpperCase().includes(value)
  );
});


  // ✅ FUNÇÃO PARA CALCULAR MESES
  function getMonthsDifference(dateString: string) {
  const createdDate = new Date(dateString); // ✅ funciona com YYYY-MM-DD

  const today = new Date();

  const years = today.getFullYear() - createdDate.getFullYear();
  const months = today.getMonth() - createdDate.getMonth();

  return years * 12 + months;
}

  // ✅ FUNÇÃO PARA DEFINIR COR
  function getTagColor(dateString: string) {
    const months = getMonthsDifference(dateString);

    if (months < 6) return "bg-green-500";
    if (months >= 6 && months < 12) return "bg-yellow-400";
    return "bg-red-600";
  }

  useEffect(() => {
    function loadRots() {
      if (!user?.uid) {
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
              cliente: doc.data().cliente || "",
              images: doc.data().images,
              uid: doc.data().uid
            })
          })

          setRots(listrots);
        })
    }

    loadRots();
  }, [user])

  // ✅ EXCLUSÃO COM CONFIRMAÇÃO (SEM APAGAR STORAGE)
  async function handleDeleteRot(rot: RotProps) {

    if (!window.confirm("Tem certeza que deseja excluir?")) return;

    try {
      const docRef = doc(db, "rots", rot.id)
      await deleteDoc(docRef);

      setRots(prev => prev.filter(item => item.id !== rot.id))

    } catch (err) {
      alert("Erro ao excluir o item!")
    }
  }

  return (
    <Container>
      <DashboardHeader />

      <section className="bg-white p-3 rounded-lg w-full max-w-xl mx-auto flex gap-2 mb-4">
      <input
        className="w-full border-2 rounded-lg h-9 px-3 outline-none"
        placeholder="Buscar por MAC, série ou modelo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button
        onClick={() => setSearch("")}
        className="bg-gray-500 px-4 rounded-lg text-white"
      >
        Limpar
      </button>
    </section>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {filteredRots.map((rot) => {

          const months = getMonthsDifference(rot.data);
          const tagColor = getTagColor(rot.data);

          return (
         
            
            <section key={rot.id} className="w-full bg-white rounded-lg relative shadow-md">


              {/* ✅ ETIQUETA DE TEMPO */}
              <div className={`${tagColor} text-white text-xs px-2 py-1 rounded absolute left-2 top-2`}>
                {months} meses
              </div>

              <button
                onClick={() => handleDeleteRot(rot)}
                className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow">
                <FiTrash2 size={26} color="#000" />
              </button>

              <img
                className="w-full rounded-lg max-h-72 mb-2"
                src={rot.images[0]?.url}
                alt=""
              />

              <p className="font-bold mt-1 px-2 mb-2">MODELO: {rot.model}</p>

              <div className="flex flex-col px-2">
                <strong className="text-black font-bold">
                  {rot.mac}
                </strong>
                <br />
                <strong className="text-black font-bold">
                  R$: {rot.price}
                </strong>

                {/* ✅ CLIENTE */}
                <span className={`text-xs px-2 py-1 rounded mt-2 w-fit ${
                  rot.cliente 
                    ? "bg-red-100 text-red-600" 
                    : "bg-green-100 text-green-600"
                }`}>
                  {rot.cliente 
                    ? `Em uso: ${rot.cliente}` 
                    : "Disponível"}
                </span>
              </div>

            </section>
          )
        })}
      </main>
    </Container>
  )
}