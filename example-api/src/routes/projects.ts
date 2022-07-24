import express from "express";
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, remove, update, query, onValue } from "firebase/database";
import firebaseConfig from "../firebaseConfig.json";

const router = express.Router();

const firebaseConfigJson = firebaseConfig as Record<string, string>;
const firebaseApp = initializeApp(firebaseConfigJson);

// create project
router.post("/projects", async (req, res) => {
  const db = getDatabase(firebaseApp);
  const projectListRef = ref(db, 'projects');
  const newProjectRef = push(projectListRef);
  set(newProjectRef, {
    name: req.body.name,
    description: req.body.description
  });
  res.json({ status: "success" });
});

// get project list
router.get("/projects", async (req, res) => {
  const db = getDatabase(firebaseApp);
  const projectListRef = query(ref(db, 'projects'));
  onValue(projectListRef, (snapshot) => {
    const projectList = snapshot.val();
    res.json({ projectList });
  });
});

// get project by id
router.get("/projects/:id", async (req, res) => {
  const db = getDatabase(firebaseApp);
  const projectRef = query(ref(db, 'projects/' + req.params.id));
  onValue(projectRef, (snapshot) => {
    const project = snapshot.val();
    res.json({ project });
  });
});

// update project by id
router.put("/projects/:id", async (req, res) => {
  const db = getDatabase(firebaseApp);
  const newProject = {
    name: req.body.name,
    description: req.body.description
  };
  const updates: any = {};
  updates['projects/' + req.params.id] = newProject;

  update(ref(db), updates);
  res.json({ status: "success" });
});

// delete project by id
router.delete("/projects/:id", async (req, res) => {
  const db = getDatabase(firebaseApp);
  const projectRef = ref(db, 'projects/' + req.params.id);
  remove(projectRef);
  res.json({ status: "success" });
});

export default router;
