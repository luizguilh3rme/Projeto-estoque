import { Container } from "../../components/container";

export function Home() {

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

      {/* O css que faz a separação em 3, 2 e 1 card esta aqui na className do main */}
      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* A section é referente a cada item do roteador */}
        <section className="w-full bg-white rounded-lg">
          <img
          className="w-full rounded-lg max-h-72 mb-2  hover:scale-105 transition-all" 
          src="https://backend.intelbras.com/sites/default/files/styles/medium/public/2024-02/sr1041e-frontal.png" 
          alt="Roteador" />
          <p className="font-bold mt-1 mb-2 px-2">W5-2100G</p>

          <div className="flex flex-col px-2">
            <span className="text-zinc-700 mb-6">Data 15/12/2025</span>
            <strong className="text-black font-medium text-xl">Mac: fderwer46yw2</strong>
          </div>

          <div className="w-full h-px bg-slate-200 my-2"></div>
    
          <div className="px-2 pb-2">
            <span className="text-black">
              R$ 350.00
            </span>
          </div>

        </section>
        

      </main>
    </Container>
  )
}

