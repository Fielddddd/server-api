const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = process.env.PORT || 8000;

const customers = [
    {id: 2535, name:"Charlie Doe", birthdate: "1990-01-01"},
    {id: 1234, name:"Steven Adams", birthdate: "1990-01-01"}
];

app.use(express.json());

const logs_url = "https://app-tracking.pockethost.io/api/collections/drone_logs/records";

// POST /logs - บันทึกข้อมูล logs
app.post("/logs", async (req, res) => {
    try {
        if (typeof req.body.max_speed === 'undefined') {
            req.body.max_speed = 100; 
        } else if (req.body.max_speed > 110) {
            req.body.max_speed = 110;
        }

        const rawData = await fetch(logs_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body)
        });

        if (!rawData.ok) {
            return res.status(rawData.status).send({ error: 'Failed to log temperature.' });
        }

        res.send({ status: "success", message: "Temperature logged successfully." });
    } catch (error) {
        console.error("Error logging temperature:", error);
        res.status(500).send({ error: "Error logging temperature" });
    }
});

// GET /logs - ดึงข้อมูล logs ทั้งหมด
app.get("/logs", async (req, res) => {
    try {
        const rawData = await fetch(logs_url, { method: "GET" });
        const jsonData = await rawData.json();
        const logs = jsonData.items;
        res.send(logs);
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).send({ error: "Error fetching logs" });
    }
});

// GET /logs/:drone_id - ดึงข้อมูล logs สำหรับ drone_id ที่พิม
app.get("/logs/:drone_id", async (req, res) => {
    const droneId = req.params.drone_id;

    try {
        const rawData = await fetch(logs_url, { method: "GET" });
        const jsonData = await rawData.json();
        const logs = jsonData.items;

        const filteredLogs = logs.filter(log => log.drone_id == droneId);

        if (filteredLogs.length === 0) {
            return res.status(404).send({ error: "No logs found for this drone_id" });
        }

        res.send(filteredLogs);
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).send({ error: "Error fetching logs" });
    }
});

// GET /customers - ดึงข้อมูลลูกค้าทั้งหมด
app.get('/customers', (req, res) => {
    res.send(customers);
});

// GET /customers/:id - ดึงข้อมูลลูกค้าตาม id
app.get('/customers/:id', (req, res) => {
    const id = req.params.id;
    const myCustomer = customers.find(item => item.id == id);
    res.send(myCustomer);
});

// DELETE /customers/:id - ลบลูกค้าตาม id
app.delete('/customers/:id', (req, res) => {
    const id = req.params.id;
    const index = customers.findIndex(item => item.id == id);
    if (index !== -1) {
        customers.splice(index, 1);
        res.send({ status: "success", message: "Customer Deleted" });
    } else {
        res.status(404).send({ error: "Customer not found" });
    }
});

// POST /customers
app.post('/customers', (req, res) => {
    const newCustomer = req.body;
    customers.push(newCustomer);
    res.send({ status: "success", message: "Customer created" });
});

// GET / - หน้าแรก
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Running server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
