const express = require("express");
// แก้ fetch เป็นการใช้ dynamic import สำหรับ ES Module ของ node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();
const port = process.env.PORT || 8000;


app.use(express.json());

const config_url = " https://script.google.com/macros/s/AKfycbzwclqJRodyVjzYyY-NTQDb9cWG6Hoc5vGAABVtr5-jPA_ET_2IasrAJK4aeo5XoONiaA/exec";
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

// GET /configs - ดึงข้อมูล configs ทั้งหมด
app.get("/configs", async (req, res) => {
    try {
        const rawData = await fetch(config_url, { method: "GET" });
        if (!rawData.ok) {
            throw new Error(`HTTP error! status: ${rawData.status}`);
        }
        const jsonData = await rawData.json();
        console.log("Received data:", jsonData); // พิมพ์ข้อมูลที่ได้รับ

        const config = jsonData.data || []; // ดึงข้อมูลจาก jsonData.data แทน jsonData.items

        // ปรับค่าของ max_speed ตามเงื่อนไขที่กำหนด
        config.forEach(item => {
            if (item.max_speed === undefined || item.max_speed === null || item.max_speed === "") {
                item.max_speed = 100; // ถ้าไม่มี max_speed ให้ตั้งค่าเป็น 100
            } else if (item.max_speed > 110) {
                item.max_speed = 110; // ถ้า max_speed มากกว่า 110 ให้ตั้งค่าเป็น 110
            }
        });

        res.send(config); // ส่งข้อมูล config กลับไปยังผู้ใช้
    } catch (error) {
        console.error("Error fetching config:", error);
        res.status(500).send({ error: "Error fetching config" });
    }
});


// GET /configs/:id - ดึงข้อมูล config ตาม drone_id
app.get("/configs/:id", async (req, res) => {
    try {
        const rawData = await fetch(config_url, { method: "GET" });
        if (!rawData.ok) {
            throw new Error(`HTTP error! status: ${rawData.status}`);
        }
        const jsonData = await rawData.json();
        console.log("Received data:", jsonData); // พิมพ์ข้อมูลที่ได้รับ

        const configs = jsonData.data || []; // ดึงข้อมูลทั้งหมดจาก jsonData.data
        const id = parseInt(req.params.id); // แปลงพารามิเตอร์ id เป็นจำนวนเต็ม

        // กรองข้อมูลโดยใช้ drone_id
        const filteredConfig = configs.filter(config => config.drone_id === id); 

        // ปรับค่าของ max_speed ตามเงื่อนไขที่กำหนด
        filteredConfig.forEach(item => {
            if (item.max_speed === undefined || item.max_speed === null || item.max_speed === "") {
                item.max_speed = 100; // ถ้าไม่มี max_speed ให้ตั้งค่าเป็น 100
            } else if (item.max_speed > 110) {
                item.max_speed = 110; // ถ้า max_speed มากกว่า 110 ให้ตั้งค่าเป็น 110
            }
        });

        if (filteredConfig.length > 0) {
            res.send(filteredConfig); // ส่งข้อมูลที่กรองกลับไปยังผู้ใช้
        } else {
            res.status(404).send({ error: "Config not found" }); // ถ้าไม่พบ config
        }
    } catch (error) {
        console.error("Error fetching config:", error);
        res.status(500).send({ error: "Error fetching config" });
    }
});


// GET /status/:id - ดึงข้อมูล condition ของ config ที่มี drone_id ตามที่ระบุ
app.get("/status/:id", async (req, res) => {
    const droneId = req.params.id; // ดึง drone_id จากพารามิเตอร์
    try {
        const rawData = await fetch(config_url, { method: "GET" });
        if (!rawData.ok) {
            throw new Error(`HTTP error! status: ${rawData.status}`);
        }
        const jsonData = await rawData.json();
        console.log("Received data:", jsonData); // พิมพ์ข้อมูลที่ได้รับ

        const configs = jsonData.data || []; // ดึงข้อมูลทั้งหมดจาก jsonData.data
        // ค้นหา config ที่ตรงกับ drone_id ที่ระบุ
        const filteredConfig = configs.find(config => config.drone_id === parseInt(droneId));

        if (filteredConfig) {
            res.send({ condition: filteredConfig.condition }); // ส่งเฉพาะ condition กลับไปยังผู้ใช้
        } else {
            res.status(404).send({ error: "Config not found" }); // กรณีไม่พบ drone_id
        }
    } catch (error) {
        console.error("Error fetching status:", error);
        res.status(500).send({ error: "Error fetching status" });
    }
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


// GET / - หน้าแรก
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Running server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
