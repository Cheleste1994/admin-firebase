import express from 'express';
import admin from 'firebase-admin';
import cors from 'cors';

const {default: serviceAccount} = await import ('./src/serviceAccountkey.json', {
  assert: {
    type: "json",
  },
})

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://dashboard-747ff-default-rtdb.europe-west1.firebasedatabase.app'
});

const auth = admin.auth();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/users/list', async (req, res) => {
  try {
    const userList = await auth.listUsers();
    res.json(userList.users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/users/data', async (req, res) => {
  try {
    const { users } = req.body;

    const userData = await auth.getUsers(users);
    res.json(userData.users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/user/:userId', async (req, res) => {
  try {
    const { uid } = req.body;

    const userData = await auth.getUser(uid);

    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userRecord = await auth.createUser({
      email,
      password
    });
    res.json(userRecord.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/users', async (req, res) => {
  try {
    const { uid, disabled } = req.body;
    const userRecord = await auth.updateUser(uid, {
      disabled,
    });
    res.json(userRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/users/:userId', async (req, res) => {
  try {
    const { usersArr } = req.body;

    await auth.deleteUsers(usersArr);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
