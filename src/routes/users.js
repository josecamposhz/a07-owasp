const { Router } = require('express');
const db = require('../db/users');
const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await db.getUsers();
    res.status(200).json(users)
  } catch (error) {
    res.status(500).send(error)
  }
});

router.delete("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    await db.deleteUser(email);
    res.status(201).json('Usuario eliminado con éxito');
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;