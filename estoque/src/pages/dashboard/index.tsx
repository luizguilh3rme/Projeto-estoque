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

  // ✅ FUNÇÃO PARA CALCULAR MESES
  function getMonthsDifference(dateString: string) {
    const [day, month, year] = dateString.split("/");

    const createdDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

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

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {rots.map((rot) => {

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
                <strong className="text-black font-bold">
                  R$: {rot.price}
                </strong>
              </div>

              <div className="w-full h-px bg-slate-200 my-2"></div>

              <div className="px-2 pb-2">
                <span className="text-black">
                  DATA: {rot.data}
                </span>
              </div>

            </section>
          )
        })}
      </main>
    </Container>
  )
}