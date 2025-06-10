import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// Initialize Firebase with your config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [participantName, setParticipantName] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Auth functions
  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert(error.message);
    }
  };

  // Project functions
  const createProject = () => {
    if (!projectName.trim()) return;
    
    const newProject = {
      id: Date.now(),
      name: projectName,
      participants: [],
      expenses: []
    };
    
    setProjects([...projects, newProject]);
    setProjectName('');
  };

  const selectProject = (project) => {
    setCurrentProject(project);
    setParticipants(project.participants || []);
    setExpenses(project.expenses || []);
  };

  // Participant functions
  const addParticipant = () => {
    if (!participantName.trim()) return;
    
    const newParticipant = {
      id: Date.now(),
      name: participantName
    };
    
    setParticipants([...participants, newParticipant]);
    setParticipantName('');
    
    if (currentProject) {
      const updatedProjects = projects.map(p => 
        p.id === currentProject.id 
          ? {...p, participants: [...p.participants, newParticipant]} 
          : p
      );
      setProjects(updatedProjects);
    }
  };

  // Expense functions
  const toggleParticipantSelection = (participantId) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const addExpense = () => {
    if (!expenseDescription.trim() || expenseAmount <= 0 || selectedParticipants.length === 0) return;
    
    const newExpense = {
      id: Date.now(),
      description: expenseDescription,
      amount: parseFloat(expenseAmount),
      paidBy: user.uid,
      participants: selectedParticipants,
      date: new Date().toISOString()
    };
    
    setExpenses([...expenses, newExpense]);
    setExpenseDescription('');
    setExpenseAmount(0);
    setSelectedParticipants([]);
    
    if (currentProject) {
      const updatedProjects = projects.map(p => 
        p.id === currentProject.id 
          ? {...p, expenses: [...p.expenses, newExpense]} 
          : p
      );
      setProjects(updatedProjects);
    }
  };

  // Calculation functions
  const calculateBalances = () => {
    if (!currentProject || currentProject.participants.length === 0) return {};
    
    const balances = {};
    currentProject.participants.forEach(p => balances[p.id] = 0);
    
    currentProject.expenses.forEach(expense => {
      const amountPerParticipant = expense.amount / expense.participants.length;
      
      // Add to the payer
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
      
      // Subtract from each participant
      expense.participants.forEach(pid => {
        balances[pid] = (balances[pid] || 0) - amountPerParticipant;
      });
    });
    
    return balances;
  };

  const balances = calculateBalances();

  if (!user) {
    return (
      <div className="auth-container">
        <h2>Iniciar sessió / Registrar-se</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contrasenya"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="auth-buttons">
          <button onClick={handleSignIn}>Iniciar sessió</button>
          <button onClick={handleSignUp}>Registrar-se</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <h1>Gestor de Projectes</h1>
        <button onClick={handleSignOut}>Tancar sessió</button>
      </header>
      
      <div className="main-content">
        {/* Projects Section */}
        <div className="projects-section">
          <h2>Projectes</h2>
          <div className="project-create">
            <input
              type="text"
              placeholder="Nom del projecte"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <button onClick={createProject}>Crear Projecte</button>
          </div>
          
          <div className="project-list">
            {projects.map(project => (
              <div 
                key={project.id} 
                className={`project-item ${currentProject?.id === project.id ? 'active' : ''}`}
                onClick={() => selectProject(project)}
              >
                {project.name}
              </div>
            ))}
          </div>
        </div>
        
        {/* Current Project Section */}
        {currentProject && (
          <div className="current-project">
            <h2>{currentProject.name}</h2>
            
            {/* Participants */}
            <div className="participants-section">
              <h3>Participants</h3>
              <div className="participant-add">
                <input
                  type="text"
                  placeholder="Nom del participant"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                />
                <button onClick={addParticipant}>Afegir Participant</button>
              </div>
              
              <div className="participant-list">
                {participants.map(p => (
                  <div key={p.id} className="participant-item">
                    {p.name}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Expenses */}
            <div className="expenses-section">
              <h3>Despeses</h3>
              <div className="expense-add">
                <input
                  type="text"
                  placeholder="Descripció"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Quantitat"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                
                <div className="expense-participants">
                  <h4>Dividir entre:</h4>
                  {participants.map(p => (
                    <label key={p.id}>
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(p.id)}
                        onChange={() => toggleParticipantSelection(p.id)}
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
                
                <button onClick={addExpense}>Afegir Despesa</button>
              </div>
              
              <div className="expense-list">
                {expenses.map(expense => (
                  <div key={expense.id} className="expense-item">
                    <div>{expense.description}</div>
                    <div>{expense.amount} €</div>
                    <div>Pagat per: {participants.find(p => p.id === expense.paidBy)?.name || 'Tu'}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Balances */}
            <div className="balances-section">
              <h3>Balances</h3>
              <table>
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map(p => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td className={balances[p.id] > 0 ? 'positive' : balances[p.id] < 0 ? 'negative' : ''}>
                        {balances[p.id]?.toFixed(2) || '0.00'} €
                        {balances[p.id] > 0 ? ' (ha de rebre)' : balances[p.id] < 0 ? ' (ha de pagar)' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;