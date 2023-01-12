import express from "express"
import cors from "cors"
import joi from "joi"
import dotenv from "dotenv"
import dayjs from "dayjs"
import { MongoClient } from "mongodb"

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())

const mongoClient = new MongoClient(process.env.DATABASE_URL)


try {
    await mongoClient.connect();
    console.log('MongoDB conectado!');
} catch (err) {
    console.log(err.message);
}
const db = mongoClient.db()


let hora = dayjs().format("HH:mm:ss")
console.log(hora)


//REQUISITO 01
app.post("/participants", async (req, res) => {
    const { name } = req.body

    //FALTA FAZER AS VALIDAÇÕES 


    try {
        const usuarioExiste = await db.collection("participants").findOne({ name })

        if (usuarioExiste) return res.status(409).send("Esse nome já está sendo utilizado")

        await db.collection("participants").insertOne({ name, lastStatus: Date.now() })

        await db.collection("messages").insertOne({
            from: name,
            to: "Todos",
            text: "entra na sala...",
            type: "status",
            time: hora
        })

        res.sendStatus(201)

    } catch (err) {
        res.status(500).send("Erro no servidor")
        console.log(err)
    }


})

//REQUISITO 02
app.get("/participants", async (req, res) => {
    try {
        const usuariosOnline = await db.collection("participants").find().toArray()
        res.send(usuariosOnline)
    } catch (err) {
        console.log(err)
    }
})


//REQUISITO 03
app.post("/messages", async (req, res) => {
    const { to, text, type } = req.body
    const { user } = req.headers

    try {

        const remetente = await db.collection("participants").findOne({ name: user })
        console.log(remetente)

        if (!remetente) return res.status(422).send("Usuário não está logado")

        const mensagens = db.collection("messages").insertOne({
            from: user,
            to,
            text,
            type,
            time: hora
        })

        res.status(201).send(mensagens)
    } catch (err) {
        console.log(err)
    }

})

// REQUISITO 04
app.get("/messages", async (req, res) => {
    try {
        const mensagens = await db.collection("messages").find().toArray()
        res.send(mensagens)
    } catch (err) {
        console.log(err)
    }
})


const PORT = 5000
app.listen(PORT, () => console.log(`Servidor rodando na porta: ${PORT}`))