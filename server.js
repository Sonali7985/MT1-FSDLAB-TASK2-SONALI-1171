// Student Record Management API (Set B)
const express = require('express');
const app = express();
const PORT = 3000;

// so that we can read JSON from the request body
app.use(express.json());

// data is stored in this array (no database)
let students = [
  { id: 201, rollNumber: 'CSE2401', name: 'Aarav Sharma', branch: 'CSE', semester: 3, email: 'aarav@example.com' },
  { id: 202, rollNumber: 'ECE2402', name: 'Diya Verma', branch: 'ECE', semester: 3, email: 'diya@example.com' },
  { id: 203, rollNumber: 'CSE2403', name: 'Kabir Singh', branch: 'CSE', semester: 3, email: 'kabir@example.com' }
];

let nextId = 204;

// checks the student data, returns an error message or null
function validateStudent(data) {
  if (typeof data.rollNumber !== 'string' || data.rollNumber.trim() === '') {
    return 'rollNumber is required and must be a string';
  }
  if (typeof data.name !== 'string' || data.name.trim() === '') {
    return 'name is required and must be a string';
  }
  if (typeof data.branch !== 'string' || data.branch.trim() === '') {
    return 'branch is required and must be a string';
  }
  if (typeof data.semester !== 'number' || isNaN(data.semester)) {
    return 'semester is required and must be a number';
  }
  if (typeof data.email !== 'string' || !data.email.includes('@')) {
    return 'a valid email is required';
  }
  return null;
}

// 1. GET all students
app.get('/api/students', (req, res) => {
  res.status(200).json(students);
});

// 6. Filter by branch (keep this above /:id)
app.get('/api/students/filter', (req, res) => {
  const branch = req.query.branch;

  if (!branch) {
    return res.status(400).json({ message: 'Please give branch in the query, e.g. ?branch=cse' });
  }

  const result = students.filter(s => s.branch.toLowerCase() === branch.toLowerCase());
  res.status(200).json(result);
});

// 3. GET student by id
app.get('/api/students/:id', (req, res) => {
  const id = Number(req.params.id);
  const student = students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.status(200).json(student);
});

// 2. POST a new student
app.post('/api/students', (req, res) => {
  const data = req.body || {};
  const error = validateStudent(data);

  if (error) {
    return res.status(400).json({ message: error });
  }

  // roll number should be unique
  const alreadyThere = students.find(s => s.rollNumber === data.rollNumber);
  if (alreadyThere) {
    return res.status(400).json({ message: 'This rollNumber already exists' });
  }

  const newStudent = {
    id: nextId++,
    rollNumber: data.rollNumber,
    name: data.name,
    branch: data.branch,
    semester: data.semester,
    email: data.email
  };

  students.push(newStudent);
  res.status(201).json(newStudent);
});

// 4. PUT - update a student
app.put('/api/students/:id', (req, res) => {
  const id = Number(req.params.id);
  const student = students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const data = req.body || {};
  const error = validateStudent(data);
  if (error) {
    return res.status(400).json({ message: error });
  }

  // another student should not already have this roll number
  const clash = students.find(s => s.rollNumber === data.rollNumber && s.id !== id);
  if (clash) {
    return res.status(400).json({ message: 'This rollNumber already exists' });
  }

  student.rollNumber = data.rollNumber;
  student.name = data.name;
  student.branch = data.branch;
  student.semester = data.semester;
  student.email = data.email;

  res.status(200).json(student);
});

// 5. DELETE a student
app.delete('/api/students/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = students.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  students.splice(index, 1);
  res.status(200).json({ message: 'Student deleted successfully' });
});

// if the JSON sent is broken, send 400 instead of crashing
app.use((err, req, res, next) => {
  res.status(400).json({ message: 'Invalid JSON in request body' });
});

app.listen(PORT, () => {
  console.log('Server is running on http://localhost:' + PORT);
});