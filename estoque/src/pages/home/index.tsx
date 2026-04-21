import { useState, useEffect } from 'react'
import { Container } from "../../components/container";
import { Link } from 'react-router-dom';

import { collection, query, getDocs, orderBy, where } from 'firebase/firestore'
import { db } from '../../services/firebaseConnection'

interface RotsProps {
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

interface RotImageProps {
  name: string;
  uid: string;
  url: string;
}

export function Home() {
  const [rots, setRots] = useState<RotsProps[]>([])
  const [loadImages, setLoadImages] = useState<string[]>([])
  const [input, setInput] = useState("")

  // ✅ FUNÇÃO PARA CALCULAR MESES
  function getMonthsDifference(dateString: string) {
  const createdDate = new Date(dateString); // funciona com YYYY-MM-DD

  const today = new Date();

  const years = today.getFullYear() - createdDate.getFullYear();
  const months = today.getMonth() - createdDate.getMonth();

  return years * 12 + months;
}


  // ✅ FUNÇÃO PARA DEFINIR COR
    function getTagColor(dateString: string, model: string) {
    const months = getMonthsDifference(dateString);

    const isRouter = model.toUpperCase().includes("ROTEADOR");

    // 🔵 REGRA PARA ROTEADORES
    if (isRouter) {
      if (months <= 24) return "bg-green-500";
      if (months <= 60) return "bg-yellow-400";
      return "bg-red-600";
    }

    // 🟢 REGRA PADRÃO (ONT / ONU)
    if (months < 6) return "bg-green-500";
    if (months < 12) return "bg-yellow-400";
    return "bg-red-600";
  }


  useEffect(() => {
    loadRots();
  }, [])

  function loadRots() {
    const rotsRef = collection(db, "rots")
    const queryRef = query(rotsRef, orderBy("created", "desc"))

    getDocs(queryRef)
      .then((snapshot) => {
        let listrots: RotsProps[] = [];

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

  function handleImageLoad(id: string) {
    setLoadImages((prev) => [...prev, id])
  }

  async function handleSearchRot() {
    if (input === '') {
      loadRots();
      return;
    }

    setRots([]);
    setLoadImages([]);

    const macQuery = query(
      collection(db, "rots"),
      where("mac", ">=", input.toUpperCase()),
      where("mac", "<=", input.toUpperCase() + "\uf8ff")
    );

    const serieQuery = query(
      collection(db, "rots"),
      where("NumeroSerie", ">=", input.toUpperCase()),
      where("NumeroSerie", "<=", input.toUpperCase() + "\uf8ff")
    );

    

    const [macSnapshot, serieSnapshot] = await Promise.all([
      getDocs(macQuery),
      getDocs(serieQuery),
    ]);

    let listrots: RotsProps[] = [];

    macSnapshot.docs.forEach((doc) => {
      listrots.push({ id: doc.id, ...doc.data() } as RotsProps);
    });

    serieSnapshot.docs.forEach((doc) => {
      if (!listrots.some(item => item.id === doc.id)) {
        listrots.push({ id: doc.id, ...doc.data() } as RotsProps);
      }
    });

    setRots(listrots);
  }


  //Filtrar pelo modelo selecionado
  const [filterModel, setFilterModel] = useState<string>("")

  const filteredRots = filterModel
  ? rots.filter(rot =>
      rot.model.toUpperCase().includes(filterModel.toUpperCase())
    )
  : rots;

  //Mostrar a quantidade de equipamentos totais do modelo que foi filtrado em sistema
  const totalFiltrados = filteredRots.length;



  return (
    <Container>

      <section className='flex flex-col gap-3'>

  {/* 🔹 TOTAL (alinhado à esquerda) */}
  <div className="flex justify-start">
    <h2 className="text-lg bg-green-500 h-8 px-3 rounded-lg text-white font-medium flex items-center">
      {filterModel
        ? `Total de ${filterModel}: ${totalFiltrados}`
        : `Total de equipamentos: ${totalFiltrados}`}
    </h2>
  </div>
  <br />

  {/* 🔹 BOTÕES (centralizados) */}
  <div className='flex flex-wrap gap-4 justify-center'>

    <button onClick={() => setFilterModel("W5")}
      className='bg-red-500 h-8 px-7 rounded-lg text-white font-medium text-lg'>
      ROTEADOR W5  GIGA
    </button>

    <button onClick={() => setFilterModel("SR1041E")}
      className='bg-red-500 h-8 px-7 rounded-lg text-white font-medium text-lg'>
      ROTEADOR SR1041E
    </button>

    <button onClick={() => setFilterModel("ONT")}
      className='bg-red-500 h-8 px-7 rounded-lg text-white font-medium text-lg'>
      ONT INTELBRAS
    </button>

    <button onClick={() => setFilterModel("ONU INTELBRAS")}
      className='bg-red-500 h-8 px-7 rounded-lg text-white font-medium text-lg'>
      ONU INTELBRAS
    </button>

    <button onClick={() => setFilterModel("TP-LINK")}
      className='bg-red-500 h-8 px-7 rounded-lg text-white font-medium text-lg'>
      ONU TP-LINK
    </button>

  </div>

</section>

    <br />
    <br />
    
      <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
        <input
          className="w-full border-2 rounded-lg h-9 px-3 outline-none"
          placeholder="Digite o mac ou número de série..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium text-lg"
          onClick={handleSearchRot}>
          Buscar
        </button>
      </section>

      <h1 className="font-bold text-center mt-6 text-2xl mb-4">
        ESTOQUE
      </h1>

      <main className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

        {filteredRots.map(rot => {

          const months = getMonthsDifference(rot.data);
          const tagColor = getTagColor(rot.data, rot.model);

          return (
            <Link key={rot.id} to={`/roteador/${rot.id}`}>
              <section className="relative w-full bg-white rounded-lg shadow-md">

                {/* ✅ ETIQUETA DE TEMPO */}
                <div className={`${tagColor} text-white text-xs px-2 py-1 rounded absolute left-2 top-2`}>
                  {months} meses
                </div>

                <div
                  className='w-full h-72 rounded-lg bg-slate-200'
                  style={{ display: loadImages.includes(rot.id) ? "none" : "block" }}>
                </div>

                <img
                  className="w-full rounded-lg max-h-72 mb-2 hover:scale-105 transition-all"
                  src={rot.images[0]?.url}
                  alt="Roteador"
                  onLoad={() => handleImageLoad(rot.id)}
                  style={{ display: loadImages.includes(rot.id) ? "block" : "none" }}
                />

                <div className="flex flex-col px-2">
                  <strong className="font-bold mt-1 mb-2 px-2">
                    MODELO: {rot.model}
                  </strong>
                  <strong className="font-bold mt-1 mb-2 px-2">
                    {rot.mac}
                  </strong>
                  <span className="text-zinc-700 mt-1 mb-2 px-2">
                    DATA CADASTRO: {rot.data}
                  </span>
                </div>

                <div className="w-full h-px bg-slate-200 my-2"></div>

              </section>
            </Link>
          )
        })}

      </main>
    </Container>
  )
}