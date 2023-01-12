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

let db;

try {
    mongoClient.connect();
    db = mongoClient.db()
    console.log('MongoDB conectado!');
} catch (err) {
    console.log(err.message);
}

let hora = dayjs().format("HH:mm:ss")
console.log(hora)

app.post("/participants", async (req, res) => {
    const { name } = req.body

    try {
        const usuarioExiste = await db.collection("participants").findOne({ name })

        if (usuarioExiste) return res.status(409).send("Esse nome já está sendo utilizado")

        await db.collection("participants").insertOne({ name, lastStatus: Date.now() })

        await db.collection("messages").insertOne({
            from: name, 
            to: "Todos", 
            text: "entra na sala...", 
            type: "status",
            time: hora})

        res.sendStatus(201)

    } catch (err) {
        res.status(500).send("Erro no servidor")
        console.log(err)
    }

   
})


app.get("/participants", async (req, res) => {
    try {
        const usuariosOnline = await db.collection("participants").find().toArray()
        res.send(usuariosOnline)
    } catch (err) {
        console.log(err)
    }
})

const PORT = 5001
app.listen(PORT, () => console.log(`Servidor rodando na porta: ${PORT}`))