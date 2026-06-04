import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import students from './assets/students.png';
import api from './services/api';
import { 
  Home, 
  Compass, 
  BookOpen, 
  Users, 
  User, 
  Settings, 
  Search, 
  Plus, 
  MessageSquare, 
  Bell, 
  Lightbulb, 
  CodeXml, 
  BookMarked, 
  SquareFunction, 
  Palette,
  LogOut,
  Check,
  Calendar,
  Laptop,
  AlertTriangle,
  Clock,
  DoorClosed,
  ChevronRight,
  BookOpenCheck,
  MessageCircle,
  GraduationCap,
  TrendingUp,
  Loader2,
  Star,
  Lock
} from 'lucide-react';

interface UserData {
  username: string;
  email: string;
  role?: string;
}

interface DashboardProps {
  user: UserData;
  onLogout: () => void;
}

interface Group {
  id: string;
  name: string;
  courseName: string;
  members: number;
  description: string;
  type: 'normal' | 'subaula';
  subaula?: string;
}

interface Booking {
  id: string;
  title: string;
  group: string;
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'no-show';
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showChatDropdown, setShowChatDropdown] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'reserva' | 'mensaje';
    title: string;
    description: string;
    time: string;
    read: boolean;
  }>>([
    {
      id: 'n1',
      type: 'reserva',
      title: 'Reserva de Aula',
      description: 'Diego Alva reservó el Cubículo A-203 para tu grupo Aula 1 - Cálculo 1 (Exclusivo).',
      time: 'Hace 5 min',
      read: false
    },
    {
      id: 'n2',
      type: 'mensaje',
      title: 'Mensaje Recibido',
      description: 'Mateo Rojas en Aula 2 - Prog. Web (Exclusivo): "¿Traemos las laptops cargadas?"',
      time: 'Hace 20 min',
      read: false
    },
    {
      id: 'n3',
      type: 'reserva',
      title: 'Reserva de Equipos',
      description: 'Lucía Méndez reservó un Kit de Sensores IoT para tu grupo Aula 1 - Física General (Exclusivo).',
      time: 'Hace 2 horas',
      read: false
    },
    {
      id: 'n4',
      type: 'mensaje',
      title: 'Mensaje de Grupo',
      description: 'Diego Alva en Aula 1 - Cálculo 1 (Exclusivo): "Compartí la pizarra digital con los apuntes."',
      time: 'Hace 1 día',
      read: true
    }
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Selected course for Step 4
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  
  // Custom states for interactiveness
  const [showCreateGroup, setShowCreateGroup] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupDesc, setNewGroupDesc] = useState<string>('');
  const [newGroupType, setNewGroupType] = useState<'normal' | 'subaula'>('normal');
  const [newGroupSubaula, setNewGroupSubaula] = useState<string>('Aula 1');

  const [userSubaulas, setUserSubaulas] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('userSubaulas');
    return saved ? JSON.parse(saved) : {
      'Cálculo I': 'Aula 1',
      'Programming Fundamentals': 'Aula 2'
    };
  });

  const [joinedGroups, setJoinedGroups] = useState<string[]>(() => {
    const saved = localStorage.getItem('joinedGroups');
    return saved ? JSON.parse(saved) : ['Grupo de Repaso Cálculo 1', 'Aula 1 - Cálculo 1 (Exclusivo)'];
  });

  useEffect(() => {
    localStorage.setItem('userSubaulas', JSON.stringify(userSubaulas));
  }, [userSubaulas]);

  useEffect(() => {
    localStorage.setItem('joinedGroups', JSON.stringify(joinedGroups));
  }, [joinedGroups]);

  const [availableGroups, setAvailableGroups] = useState<Group[]>([
    { id: '1', name: 'Grupo de Repaso Cálculo 1', courseName: 'Cálculo I', members: 4, description: 'Estudiamos los fines de semana límites y derivadas.', type: 'normal' },
    { id: '2', name: 'Aula 1 - Cálculo 1 (Exclusivo)', courseName: 'Cálculo I', members: 3, description: 'Grupo de trabajo exclusivo para alumnos del Aula 101 de Cálculo I.', type: 'subaula', subaula: 'Aula 1' },
    { id: '3', name: 'Aula 2 - Cálculo 1 (Exclusivo)', courseName: 'Cálculo I', members: 2, description: 'Grupo de trabajo exclusivo para alumnos del Aula 102 de Cálculo I.', type: 'subaula', subaula: 'Aula 2' },
    { id: '4', name: 'Grupo de Programación Web', courseName: 'Programming Fundamentals', members: 8, description: 'Aprendemos juntos desarrollo web desde cero. ¡Todos los niveles!', type: 'normal' },
    { id: '5', name: 'Aula 2 - Prog. Web (Exclusivo)', courseName: 'Programming Fundamentals', members: 5, description: 'Grupo exclusivo para resolver proyectos prácticos de la sección Aula 102.', type: 'subaula', subaula: 'Aula 2' },
    { id: '6', name: 'Grupo de Física General', courseName: 'Física General', members: 6, description: 'Resolución de ejercicios y preparación de prácticas de laboratorio.', type: 'normal' },
    { id: '7', name: 'Aula 1 - Física General (Exclusivo)', courseName: 'Física General', members: 3, description: 'Grupo de estudio exclusivo para alumnos del Aula 101 de Física General.', type: 'subaula', subaula: 'Aula 1' }
  ]);
  const myGroups = availableGroups.filter(g => joinedGroups.includes(g.name));

  // Bookings list for Step 6
  const [activeBookingTab, setActiveBookingTab] = useState<'prox' | 'comp' | 'canc'>('canc');
  const [bookings, setBookings] = useState<Booking[]>([
    { id: '1', title: 'Sala de Estudio 3 - Bloque A', group: 'Grupo: Cálculo I - Grupo 4', date: '15/may/2026', time: 'Hora: 10:00 - 12:00', status: 'no-show' }
  ]);

  // Reservation Mock State for Step 5
  const [showReservationForm, setShowReservationForm] = useState<string | null>(null);
  const [reservationSuccess, setReservationSuccess] = useState<boolean>(false);
  const [reserveSpaceCode, setReserveSpaceCode] = useState<string>('');
  const [reserveSubaulaGroup, setReserveSubaulaGroup] = useState<string>('');
  const [reserveDate, setReserveDate] = useState<string>('2026-06-05');
  const [reserveTime, setReserveTime] = useState<string>('10:00 - 12:00');
  const [reserveError, setReserveError] = useState<string | null>(null);

  // Interactive Chat Mock State
  interface ChatMessage {
    id: string;
    sender: string;
    text: string;
    time: string;
    isMe: boolean;
  }
  const [activeChatGroup, setActiveChatGroup] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState<string>('');

  // User profile state for Step 7
  const [userProfile, setUserProfile] = useState<{ 
    username: string; 
    email: string; 
    role: string; 
    career: string | null;
    averageRating?: number;
    ratingCount?: number;
  } | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string>('');
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);

  // Community rating system states (completely anonymous)
  const [communityUsers, setCommunityUsers] = useState<any[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState<boolean>(false);
  const [communitySearch, setCommunitySearch] = useState<string>('');

  const loadCommunityUsers = async () => {
    setLoadingCommunity(true);
    try {
      const response = await api.get('/users');
      setCommunityUsers(response.data);
    } catch (err) {
      console.warn('Error loading community users from backend. Using local mock profiles.', err);
      // Fallback local mock community
      setCommunityUsers([
        { id: 4, username: 'Diego Alva', email: 'diego.alva@utec.edu.pe', career: 'Ciencias de la Computación', averageRating: 4.3, ratingCount: 3, userRating: null },
        { id: 5, username: 'Mateo Rojas', email: 'mateo.rojas@utec.edu.pe', career: 'Sistemas de la Información', averageRating: 4.7, ratingCount: 5, userRating: null },
        { id: 6, username: 'Lucía Méndez', email: 'lucia.mendez@utec.edu.pe', career: 'Ingeniería Civil', averageRating: 4.0, ratingCount: 2, userRating: null }
      ]);
    } finally {
      setLoadingCommunity(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'comunidad') {
      loadCommunityUsers();
    } else if (activeTab === 'perfil') {
      const loadProfileOnly = async () => {
        try {
          const profileResponse = await api.get('/users/profile');
          if (profileResponse.data) {
            setUserProfile(profileResponse.data);
            setSelectedCareer(profileResponse.data.career || '');
            setEnrolledCourses(profileResponse.data.enrolledCourses || []);
          }
        } catch (err) {
          console.error('Error reloading profile on tab switch:', err);
        }
      };
      loadProfileOnly();
    }
  }, [activeTab]);

  const handleRateCommunityUser = async (userId: number, stars: number) => {
    const member = communityUsers.find(u => u.id === userId);
    if (!member) return;

    const memberGroups = getMemberGroups(member.username);
    const sharesSubaula = joinedGroups.some(gName => {
      if (!memberGroups.includes(gName)) return false;
      const grp = availableGroups.find(g => g.name === gName);
      return grp?.type === 'subaula';
    });

    if (!sharesSubaula) {
      alert('Solo puedes calificar a compañeros con los que compartas un grupo de aula.');
      return;
    }

    try {
      await api.post(`/users/${userId}/rate`, { stars });
      loadCommunityUsers();
      // Reload profile after rating so that stats update
      const profileResponse = await api.get('/users/profile');
      if (profileResponse.data) {
        setUserProfile(profileResponse.data);
      }
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      alert(err.response?.data?.message || 'No se pudo guardar la calificación.');
    }
  };

  const handleOpenChat = (groupName: string) => {
    setActiveChatGroup(groupName);
    setChatMessages([]);
    setNewMessageText('');
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const myMessage: ChatMessage = {
      id: String(Date.now()),
      sender: formatName(user.username),
      text: newMessageText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setChatMessages(prev => [...prev, myMessage]);
    const replyGroup = activeChatGroup;
    setNewMessageText('');

    // Simulate teammates replying after 1.5 seconds
    setTimeout(() => {
      const responses = [
        "¡Excelente! Estoy de acuerdo con la propuesta.",
        "Dale, yo me encargo de coordinar con el grupo.",
        "Quedamos en eso entonces. Nos vemos en la sesión de estudio.",
        "¿Podríamos reunirnos media hora antes para avanzar?",
        "Entendido. Yo avanzo con la presentación del proyecto."
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];
      const names = ["Diego Alva", "Mateo Rojas", "Lucía Méndez"];
      const randomSender = names[Math.floor(Math.random() * names.length)];
      
      const teammateMessage: ChatMessage = {
        id: String(Date.now() + 1),
        sender: randomSender,
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };
      
      setChatMessages(prev => [...prev, teammateMessage]);

      // Add to notification panel
      const newMsgNotif = {
        id: 'notif-msg-' + Date.now(),
        type: 'mensaje' as const,
        title: `Nuevo mensaje de ${randomSender}`,
        description: `En chat "${replyGroup}": "${randomReply}"`,
        time: 'Ahora mismo',
        read: false
      };
      setNotifications(prev => [newMsgNotif, ...prev]);
    }, 1500);
  };

  // Fetch teams and bookings from Spring Boot backend on mount
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        setLoadingProfile(true);
        // Fetch user profile from Spring Boot backend
        const profileResponse = await api.get('/users/profile');
        if (profileResponse.data) {
          setUserProfile(profileResponse.data);
          setSelectedCareer(profileResponse.data.career || '');
          setEnrolledCourses(profileResponse.data.enrolledCourses || []);
        }
      } catch (err) {
        console.warn('Backend server not running or failed to fetch user profile. Using local user context.', err);
      } finally {
        setLoadingProfile(false);
      }

      try {
        // 1. Fetch groups/teams from Spring Boot backend
        const teamsResponse = await api.get('/teams');
        if (teamsResponse.data && Array.isArray(teamsResponse.data)) {
          const loadedGroups = teamsResponse.data.map((team: any) => ({
            id: 'backend-' + team.id,
            name: team.name,
            courseName: team.university || 'General',
            members: 4 + (team.id % 5), // Mock member count logically based on ID
            description: `Grupo colaborativo registrado en el backend de UTEC Conexión para ${team.university || 'General'}.`,
            type: team.type || 'normal',
            subaula: team.subaula
          }));
          
          if (loadedGroups.length > 0) {
            setAvailableGroups(prev => {
              const names = new Set(prev.map(g => g.name));
              const uniqueLoaded = loadedGroups.filter((g: any) => !names.has(g.name));
              return [...prev, ...uniqueLoaded];
            });
          }
        }
      } catch (err) {
        console.warn('Backend server is not running or failed to fetch teams. Using local mock data instead.', err);
      }

      try {
        // 2. Fetch matches/bookings from Spring Boot backend
        const matchesResponse = await api.get('/matches');
        if (matchesResponse.data && Array.isArray(matchesResponse.data)) {
          const loadedBookings: Booking[] = matchesResponse.data.map((match: any) => {
            const dateObj = new Date(match.matchDateTime || Date.now());
            return {
              id: String(match.id),
              title: match.title || 'Reserva de Espacio',
              group: match.description || 'Grupo de estudio privado',
              date: dateObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
              time: 'Hora: ' + dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
              status: match.status === 'SCHEDULED' ? 'pending' : (match.status === 'COMPLETED' ? 'completed' : 'no-show')
            };
          });
          
          if (loadedBookings.length > 0) {
            setBookings(loadedBookings);
          }
        }
      } catch (err) {
        console.warn('Backend server is not running or failed to fetch bookings. Using local mock data instead.', err);
      }
    };

    loadBackendData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);
    try {
      const response = await api.put('/users/profile', {
        career: selectedCareer || null
      });
      if (response.data) {
        setUserProfile(response.data);
        setSelectedCareer(response.data.career || '');
        setEnrolledCourses(response.data.enrolledCourses || []);
        setProfileSuccessMsg('¡Carrera universitaria guardada correctamente!');
        setTimeout(() => setProfileSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      let msg = 'No se pudo guardar la carrera. Por favor, verifique la conexión con el servidor.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setProfileErrorMsg(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleEnrollCourse = async (courseName: string) => {
    const isEnrolled = enrolledCourses.includes(courseName);
    let newEnrolled: string[];
    if (isEnrolled) {
      newEnrolled = enrolledCourses.filter(name => name !== courseName);
    } else {
      newEnrolled = [...enrolledCourses, courseName];
    }
    
    try {
      const response = await api.put('/users/profile', {
        enrolledCourses: newEnrolled
      });
      if (response.data) {
        setUserProfile(response.data);
        setEnrolledCourses(response.data.enrolledCourses || []);
      }
    } catch (err) {
      console.error('Error toggling course enrollment:', err);
      setEnrolledCourses(newEnrolled);
    }
  };

  // Dynamic values
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(/[\s._\-]/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatName = (name: string) => {
    if (!name) return 'Usuario';
    return name
      .replace(/[\s._\-]+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getMemberGroups = (username: string): string[] => {
    const normalized = username.toLowerCase().trim();
    if (normalized.includes('diego')) {
      return ['Grupo de Repaso Cálculo 1', 'Aula 1 - Cálculo 1 (Exclusivo)', 'Grupo de Programación Web', 'Grupo de Diseño Curricular'];
    } else if (normalized.includes('mateo')) {
      return ['Grupo de Matemáticas Aplicadas', 'Grupo de Programación Web', 'Aula 2 - Prog. Web (Exclusivo)', 'Grupo de Educación y Sociedad'];
    } else if (normalized.includes('lucía') || normalized.includes('lucia')) {
      return ['Grupo de Repaso Cálculo 1', 'Aula 1 - Cálculo 1 (Exclusivo)', 'Grupo de Matemáticas Aplicadas', 'Aula 1 - Física General (Exclusivo)'];
    }
    
    // Fallback based on career for other dynamically loaded users
    const member = communityUsers.find(u => u.username === username);
    const career = member?.career || '';
    if (career.includes('Computación') || career.includes('Sistemas')) {
      return ['Grupo de Programación Web', 'Aula 2 - Prog. Web (Exclusivo)', 'Grupo de Diseño Curricular'];
    } else if (career.includes('Civil') || career.includes('Ambiental') || career.includes('Energía')) {
      return ['Grupo de Repaso Cálculo 1', 'Aula 1 - Cálculo 1 (Exclusivo)', 'Aula 1 - Física General (Exclusivo)', 'Grupo de Matemáticas Aplicadas'];
    }
    
    return ['Grupo de Repaso Cálculo 1', 'Aula 1 - Cálculo 1 (Exclusivo)'];
  };

  const getGroupRestrictionError = (group: Group): string | null => {
    if (joinedGroups.includes(group.name)) {
      return null;
    }

    const isEnrolled = enrolledCourses.includes(group.courseName);
    if (!isEnrolled) {
      return `Inscríbete en el curso de ${group.courseName} primero.`;
    }

    if (group.type === 'subaula') {
      const userAula = userSubaulas[group.courseName] || 'Aula 1';
      if (userAula !== group.subaula) {
        const expectedFriendly = group.subaula === 'Aula 1' ? 'Aula 101' : (group.subaula === 'Aula 2' ? 'Aula 102' : 'Aula 103');
        const userFriendly = userAula === 'Aula 1' ? 'Aula 101' : (userAula === 'Aula 2' ? 'Aula 102' : 'Aula 103');
        return `Grupo exclusivo de ${expectedFriendly} (Tu sección: ${userFriendly}).`;
      }
    }

    return null;
  };

  const handleJoinGroup = (groupName: string) => {
    const groupObj = availableGroups.find(g => g.name === groupName);
    if (groupObj && !joinedGroups.includes(groupName)) {
      const err = getGroupRestrictionError(groupObj);
      if (err) {
        alert(err);
        return;
      }
    }

    if (joinedGroups.includes(groupName)) {
      setJoinedGroups(joinedGroups.filter(g => g !== groupName));
    } else {
      setJoinedGroups([...joinedGroups, groupName]);
    }
  };

  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    if (newGroupType === 'subaula') {
      const userAula = selectedCourse ? userSubaulas[selectedCourse] : null;
      if (!userAula) {
        alert("Error: No puedes crear un grupo de aula si no tienes una sección asignada para este curso.");
        return;
      }
      if (newGroupSubaula !== userAula) {
        alert("Error: Solo puedes crear grupos de aula para tu sección asignada.");
        return;
      }
    }

    const newGroupMock: Group = {
      id: String(Date.now()),
      name: newGroupName.trim(),
      courseName: selectedCourse || 'General',
      members: 1,
      description: newGroupDesc.trim() || 'Grupo de estudio recién creado para colaborar.',
      type: newGroupType,
      subaula: newGroupType === 'subaula' ? newGroupSubaula : undefined
    };

    try {
      // POST to Spring Boot backend to save the new team
      const response = await api.post('/teams', {
        name: newGroupName.trim(),
        university: selectedCourse || 'General', // Map the course to the university property in Team model
        type: newGroupType,
        subaula: newGroupType === 'subaula' ? newGroupSubaula : undefined
      });

      if (response.data && response.data.id) {
        const savedGroup: Group = {
          id: 'backend-' + response.data.id,
          name: response.data.name,
          courseName: response.data.university || 'General',
          members: 1,
          description: newGroupDesc.trim() || 'Grupo de estudio registrado y guardado en el servidor.',
          type: response.data.type || newGroupType,
          subaula: response.data.subaula || (newGroupType === 'subaula' ? newGroupSubaula : undefined)
        };
        setAvailableGroups(prev => [...prev, savedGroup]);
        setJoinedGroups(prev => [...prev, savedGroup.name]);
      } else {
        setAvailableGroups(prev => [...prev, newGroupMock]);
        setJoinedGroups(prev => [...prev, newGroupMock.name]);
      }
    } catch (err) {
      console.warn('Backend server not running. Adding group to local state only.', err);
      setAvailableGroups(prev => [...prev, newGroupMock]);
      setJoinedGroups(prev => [...prev, newGroupMock.name]);
    }

    setNewGroupName('');
    setNewGroupDesc('');
    setNewGroupType('normal');
    setNewGroupSubaula('Aula 1');
    setShowCreateGroup(false);
    setSelectedCourse(null);
    setActiveTab('grupos'); // Go to groups tab
  };

  const openReservationForm = (formType: string) => {
    setReserveSpaceCode('');
    // Try to auto-select the first subaula group they are registered in, if any
    const subaulaGroups = availableGroups.filter(g => g.type === 'subaula');
    const preselected = subaulaGroups.find(g => joinedGroups.includes(g.name));
    setReserveSubaulaGroup(preselected ? preselected.name : '');
    setReserveDate('2026-06-05');
    setReserveTime('10:00 - 12:00');
    setReserveError(null);
    setShowReservationForm(formType);
  };

  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReserveError(null);

    if (!reserveSubaulaGroup) {
      setReserveError('Por favor, selecciona un grupo de aula.');
      return;
    }

    const isRegistered = joinedGroups.includes(reserveSubaulaGroup);
    if (!isRegistered) {
      setReserveError('Solo puedes realizar una reserva para un grupo de aula en el que estés registrado.');
      return;
    }

    setReservationSuccess(true);

    const bookingMock: Booking = {
      id: String(Date.now()),
      title: `${showReservationForm} - Espacio: ${reserveSpaceCode}`,
      group: reserveSubaulaGroup,
      date: reserveDate,
      time: reserveTime,
      status: 'pending'
    };

    try {
      // Create a reservation (match) in Spring Boot backend
      const response = await api.post('/matches', {
        title: `${showReservationForm} - Espacio: ${reserveSpaceCode}`,
        description: reserveSubaulaGroup,
        matchDateTime: new Date(reserveDate + 'T' + (reserveTime.split(' ')[0]) + ':00').toISOString(),
        locationId: 1, // Estadio / Coliseo / Cubículo sembrado
        disciplineId: 1, // Fútbol / Disciplina sembrada
        homeTeamId: 1, // Leones / Team sembrado
        awayTeamId: 2, // Coyotes / Team sembrado
        organizer: formatName(user.username)
      });

      if (response.data && response.data.id) {
        const dateObj = new Date(response.data.matchDateTime || Date.now());
        const savedBooking: Booking = {
          id: String(response.data.id),
          title: response.data.title || `${showReservationForm} - Espacio: ${reserveSpaceCode}`,
          group: response.data.description || reserveSubaulaGroup,
          date: dateObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: 'Hora: ' + dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          status: 'pending'
        };
        setBookings([savedBooking, ...bookings]);
      } else {
        setBookings([bookingMock, ...bookings]);
      }
    } catch (err) {
      console.warn('Backend server not running. Reserving in local state only.', err);
      setBookings([bookingMock, ...bookings]);
    }

    // Add dynamic notification for the reservation
    const newNotif = {
      id: 'notif-reserva-' + Date.now(),
      type: 'reserva' as const,
      title: 'Reserva de Espacio',
      description: `Reservaste el espacio ${reserveSpaceCode} para tu grupo ${reserveSubaulaGroup}.`,
      time: 'Ahora mismo',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    setTimeout(() => {
      setReservationSuccess(false);
      setShowReservationForm(null);
      setActiveTab('historial'); // Switch to booking history
      setActiveBookingTab('prox');
    }, 1500);
  };

  // Cursos Generales data from Step 3
  const generalCourses = [
    { name: 'Cálculo I', area: 'Área de Ciencias', color: '#FE7B02', icon: SquareFunction, bg: 'rgba(254, 123, 2, 0.15)' },
    { name: 'Física General', area: 'Área de Ciencias', color: '#a21caf', icon: BookMarked, bg: 'rgba(162, 28, 175, 0.15)' },
    { name: 'Comunicación Oral y Escrita', area: 'Área de Humanidades', color: '#0f766e', icon: MessageSquare, bg: 'rgba(15, 118, 110, 0.15)' },
    { name: 'Programming Fundamentals', area: 'Área de Ingeniería', color: '#1d4ed8', icon: CodeXml, bg: 'rgba(29, 78, 216, 0.15)' }
  ];

  // Cursos Filtro data from Step 3
  const filterCourses = [
    { name: 'Educación y Sociedad', area: 'Área Pedagógica', color: '#15803d', icon: Users, bg: 'rgba(21, 128, 61, 0.15)' },
    { name: 'Psicología del Aprendizaje', area: 'Área de Psicología', color: '#15803d', icon: Lightbulb, bg: 'rgba(21, 128, 61, 0.15)' },
    { name: 'Teorías Educativas', area: 'Área Pedagógica', color: '#15803d', icon: BookOpenCheck, bg: 'rgba(21, 128, 61, 0.15)' },
    { name: 'Diseño Curricular', area: 'Área Curricular', color: '#15803d', icon: Palette, bg: 'rgba(21, 128, 61, 0.15)' }
  ];

  // Dynamic filter based on search input
  const filteredGeneralCourses = generalCourses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFilterCourses = filterCourses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter UTEC classmates: only show students with whom the user shares at least one classroom group (grupo de aula/subaula)
  const filteredCommunity = communityUsers.filter(u => {
    if (u.username === user.username) return false; // Exclude current user from rating classmates list
    const memberGroups = getMemberGroups(u.username);
    // Only show user if they share at least one classroom group (grupo de aula/subaula)
    return joinedGroups.some(gName => {
      if (!memberGroups.includes(gName)) return false;
      const grp = availableGroups.find(g => g.name === gName);
      return grp?.type === 'subaula';
    });
  }).filter(u => 
    u.username.toLowerCase().includes(communitySearch.toLowerCase()) || 
    (u.career && u.career.toLowerCase().includes(communitySearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex text-foreground font-display bg-[#f6f9fb]">
      
      {/* Sidebar - Sleek White Design matching Mockup */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-border/60 flex-col sticky top-0 h-screen">
        
        {/* Logo Section */}
        <div className="px-6 py-5 border-b border-border/40">
          <img src={logo} alt="UTEC Conexión" className="h-12 w-auto object-contain select-none" draggable="false" />
        </div>

        {/* Navigation Options matching exact prototype steps */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => { setActiveTab('inicio'); setSelectedCourse(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'inicio' 
                ? 'bg-[color:var(--brand-green)]/10 text-[color:var(--brand-green)]' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Inicio</span>
          </button>

          <button 
            onClick={() => { setActiveTab('cursos'); setSelectedCourse(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'cursos' 
                ? 'bg-[color:var(--brand-green)]/10 text-[color:var(--brand-green)]' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Mis cursos</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('grupos'); setSelectedCourse(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'grupos' 
                ? 'bg-[color:var(--brand-green)]/10 text-[color:var(--brand-green)]' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Mis grupos</span>
          </button>

          <button 
            onClick={() => { setActiveTab('comunidad'); setSelectedCourse(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'comunidad' 
                ? 'bg-[color:var(--brand-green)]/10 text-[color:var(--brand-green)]' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Compass className="h-5 w-5" />
            <span>Comunidad</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('herramientas'); setSelectedCourse(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'herramientas' 
                ? 'bg-[color:var(--brand-green)]/10 text-[color:var(--brand-green)]' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Laptop className="h-5 w-5" />
            <span>Herramientas</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('historial'); setSelectedCourse(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'historial' 
                ? 'bg-[color:var(--brand-green)]/10 text-[color:var(--brand-green)]' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Reservas</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('perfil'); setSelectedCourse(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'perfil' 
                ? 'bg-[color:var(--brand-green)]/10 text-[color:var(--brand-green)]' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Perfil</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('configuracion'); setSelectedCourse(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'configuracion' 
                ? 'bg-[color:var(--brand-green)]/10 text-[color:var(--brand-green)]' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Configuración</span>
          </button>

          {/* Quick list of enrolled courses in Left Sidebar */}
          {enrolledCourses.length > 0 && (
            <div className="pt-4 mt-4 border-t border-border/40">
              <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Mis Cursos Activos</p>
              <div className="space-y-0.5">
                {enrolledCourses.map((courseName) => {
                  const allCourses = [...generalCourses, ...filterCourses];
                  const course = allCourses.find(c => c.name === courseName) || {
                    name: courseName,
                    icon: BookOpen,
                    color: '#6b7280',
                    bg: 'rgba(107, 114, 128, 0.15)'
                  };
                  const IconComponent = course.icon;
                  return (
                    <button 
                      key={courseName}
                      onClick={() => { setSelectedCourse(courseName); setActiveTab('inicio'); }}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-left truncate"
                    >
                      <div className="h-6 w-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: course.bg }}>
                        <IconComponent className="h-3.5 w-3.5" style={{ color: course.color }} />
                      </div>
                      <span className="truncate">{courseName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* User Card & Logout bottom section matching Mockup layout */}
        <div className="p-4 border-t border-border/40">
          <button 
            onClick={onLogout}
            title="Haga clic para cerrar sesión"
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold shrink-0">
              {getInitials(user.username)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{formatName(user.username)}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[color:var(--brand-green)]/15 text-[color:var(--brand-green)]">
                Estudiante
              </span>
            </div>
            <LogOut className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        
        {/* Header matching mockup exact icons and borders */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-border/40 px-4 sm:px-8 py-4 flex items-center gap-4">
          
          <a href="#" className="lg:hidden shrink-0">
            <img src={logo} alt="UTEC Conexión" className="h-9 w-auto" />
          </a>

          {/* Header Search bar */}
          <div className="flex-1 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cursos, grupos, usuarios o temas..." 
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-muted/60 border border-transparent focus:bg-white focus:border-border focus:outline-none text-sm" 
              type="text" 
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => { setSelectedCourse('Programming Fundamentals'); }} 
              className="h-10 w-10 rounded-xl border-2 border-[color:var(--brand-green)] text-[color:var(--brand-green)] flex items-center justify-center hover:bg-[color:var(--brand-green)]/10 transition-colors"
              title="Crear un grupo de estudio"
            >
              <Plus className="h-5 w-5" />
            </button>
            
            <button 
              onClick={() => { setActiveTab('grupos'); setSelectedCourse(null); }}
              className="h-10 w-10 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground"
              title="Mis grupos"
            >
              <Users className="h-5 w-5" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowChatDropdown(!showChatDropdown)}
                className="h-10 w-10 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground"
                title="Chats grupales"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
              
              {showChatDropdown && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border/80 bg-white p-4 shadow-xl z-50 animate-in slide-in-from-top-2 duration-200 text-left">
                  {/* Header */}
                  <div className="flex justify-between items-center pb-2 border-b border-border/40 mb-3">
                    <span className="font-bold text-xs text-foreground">Mis Chats Grupales</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">
                      {joinedGroups.length} activos
                    </span>
                  </div>

                  {/* Body list */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {joinedGroups.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-[11px] italic">
                        No te has unido a ningún grupo
                      </div>
                    ) : (
                      joinedGroups.map((gName) => {
                        const isSubaula = availableGroups.find(g => g.name === gName)?.type === 'subaula';
                        return (
                          <div 
                            key={gName}
                            className="p-2 rounded-xl border border-border/40 hover:bg-muted/30 flex items-center justify-between gap-3 transition-all"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[11px] text-foreground truncate">{gName}</p>
                              <span className={`inline-block text-[8px] font-semibold px-1.5 py-0.5 rounded-md ${
                                isSubaula 
                                  ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                                  : 'bg-orange-50 text-orange-600 border border-orange-100'
                              }`}>
                                {isSubaula ? 'Aula' : 'Estudio'}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                handleOpenChat(gName);
                                setShowChatDropdown(false);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-gradient-brand text-white text-[10px] font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
                            >
                              Entrar
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => {
                  if (!showNotifications) {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  }
                  setShowNotifications(!showNotifications);
                }}
                className="relative h-10 w-10 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground"
                title="Notificaciones"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[color:var(--brand-purple)] text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-85 rounded-2xl border border-border/80 bg-white p-4 shadow-xl z-50 animate-in slide-in-from-top-2 duration-200 text-left">
                  {/* Header */}
                  <div className="flex justify-between items-center pb-2 border-b border-border/40">
                    <span className="font-bold text-xs text-foreground">Notificaciones</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-[10px] font-semibold text-rose-500 hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Limpiar todo
                      </button>
                    )}
                  </div>

                  {/* Body list */}
                  <div className="mt-3 space-y-3 max-h-72 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-[11px] italic">
                        No tienes notificaciones
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const Icon = n.type === 'reserva' ? Calendar : MessageSquare;
                        const iconBg = n.type === 'reserva' ? 'bg-orange-50 text-orange-500 border border-orange-100' : 'bg-blue-50 text-blue-500 border border-blue-100';
                        return (
                          <div 
                            key={n.id}
                            className={`p-2.5 rounded-xl border flex gap-3 items-start transition-all relative ${
                              n.read ? 'bg-white border-border/40' : 'bg-purple-50/20 border-[color:var(--brand-purple)]/30'
                            }`}
                          >
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between items-baseline gap-1">
                                <span className="font-bold text-[11px] text-foreground truncate">{n.title}</span>
                                <span className="text-[9px] text-muted-foreground shrink-0">{n.time}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-normal mt-0.5 break-words">
                                {n.description}
                              </p>
                            </div>
                            
                            {/* Close / Dismiss button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNotifications(prev => prev.filter(item => item.id !== n.id));
                              }}
                              className="text-muted-foreground hover:text-foreground hover:scale-115 transition-all text-xs bg-transparent border-none cursor-pointer shrink-0 ml-1"
                              title="Descartar"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-sm select-none">
              {getInitials(user.username)}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-8 space-y-8 flex-grow">

          {/* VIEW: INICIO */}
          {activeTab === 'inicio' && !selectedCourse && (
            <>
              {/* If search query is NOT empty, display search results */}
              {searchQuery ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold">Resultados de búsqueda para "{searchQuery}"</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Filtrando cursos y especialidades en tiempo real.</p>
                  </div>
                  {filteredGeneralCourses.length === 0 && filteredFilterCourses.length === 0 ? (
                    <div className="text-center py-16 rounded-3xl border border-dashed border-border bg-white shadow-soft space-y-4">
                      <Search className="h-10 w-10 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="font-bold text-sm text-foreground">No se encontraron resultados</h3>
                        <p className="text-xs text-muted-foreground mt-1">No hay cursos o áreas que coincidan con "{searchQuery}"</p>
                      </div>
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="px-4 py-2 rounded-xl border border-border bg-white hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
                      >
                        Limpiar búsqueda
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {filteredGeneralCourses.length > 0 && (
                        <section className="space-y-4">
                          <h3 className="text-lg font-bold text-foreground">Cursos Generales</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {filteredGeneralCourses.map((course) => {
                              const IconComponent = course.icon;
                              return (
                                <div 
                                  key={course.name}
                                  onClick={() => setSelectedCourse(course.name)}
                                  className="rounded-2xl border bg-white p-5 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-soft transition-all duration-200 cursor-pointer flex flex-col items-start border-border/60"
                                >
                                  <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: course.bg }}>
                                    <IconComponent className="h-6 w-6" style={{ color: course.color }} />
                                  </div>
                                  <h3 className="font-bold text-sm text-foreground leading-tight mb-1">{course.name}</h3>
                                  <span className="text-[10px] font-medium text-muted-foreground">{course.area}</span>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      )}
                      
                      {filteredFilterCourses.length > 0 && (
                        <section className="space-y-4">
                          <h3 className="text-lg font-bold text-foreground">Cursos Filtro de tu Carrera</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {filteredFilterCourses.map((course) => {
                              const IconComponent = course.icon;
                              return (
                                <div 
                                  key={course.name}
                                  onClick={() => setSelectedCourse(course.name)}
                                  className="rounded-2xl border bg-white p-5 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-soft transition-all duration-200 cursor-pointer flex flex-col items-start border-border/60"
                                >
                                  <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: course.bg }}>
                                    <IconComponent className="h-6 w-6" style={{ color: course.color }} />
                                  </div>
                                  <h3 className="font-bold text-sm text-foreground leading-tight mb-1">{course.name}</h3>
                                  <span className="text-[10px] font-medium text-muted-foreground">{course.area}</span>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* EXACT Mockup grid: 2-column layout */
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                  
                  {/* Left Column: Hero, Quick actions, Recommended, CTA */}
                  <div className="space-y-6">
                    
                    {/* Hero Card matching mockup structure */}
                    <section className="relative overflow-hidden rounded-3xl bg-white shadow-card border border-border/40 p-6 sm:p-10">
                      <div className="grid md:grid-cols-2 gap-6 items-center">
                        <div>
                          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                            <span className="text-[color:var(--brand-green)]">Conecta.</span><br />
                            <span className="text-[color:var(--brand-blue)]">Comparte.</span><br />
                            <span className="text-[color:var(--brand-blue)]">Aprende. </span>
                            <span className="text-[color:var(--brand-purple)]">Crece.</span>
                          </h1>
                          <p className="mt-5 text-muted-foreground max-w-md">
                            UTEC Conexión es tu space de colaboración y aprendizaje compartido. ¡Únete a la comunidad!
                          </p>
                          <div className="mt-6 flex flex-wrap gap-3">
                            <button 
                              onClick={() => setActiveTab('grupos')}
                              className="px-6 py-3 rounded-xl bg-[color:var(--brand-green)] text-white font-semibold shadow-soft hover:opacity-90 transition cursor-pointer"
                            >
                              Explorar grupos
                            </button>
                            <button 
                              onClick={() => { setSelectedCourse('Programming Fundamentals'); }}
                              className="px-6 py-3 rounded-xl bg-white border border-border font-semibold text-foreground hover:bg-muted transition inline-flex items-center gap-2 cursor-pointer"
                            >
                              Crear grupo 
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-brand opacity-20 blur-3xl rounded-full"></div>
                          <img 
                            alt="Estudiantes UTEC Conexión" 
                            className="relative w-full max-w-md mx-auto drop-shadow-2xl select-none" 
                            src={students} 
                            draggable="false"
                          />
                        </div>
                      </div>
                    </section>

                    {/* Quick actions grid of 4 cards */}
                    <section className="rounded-3xl bg-white shadow-card border border-border/40 p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div className="flex gap-3">
                        <div className="shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in oklab, var(--brand-green) 15%, white)' }}>
                          <Users className="h-5 w-5" style={{ color: 'var(--brand-green)' }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">Crea tu grupo</h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Forma grupos con compañeros que comparten tus intereses.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in oklab, var(--brand-blue) 15%, white)' }}>
                          <MessageCircle className="h-5 w-5" style={{ color: 'var(--brand-blue)' }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">Comparte ideas</h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Intercambia recursos, apuntes y materiales de estudio.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in oklab, var(--brand-purple) 15%, white)' }}>
                          <GraduationCap className="h-5 w-5" style={{ color: 'var(--brand-purple)' }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">Aprende juntos</h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Colabora en proyectos y resuelve dudas en equipo.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in oklab, var(--brand-green) 15%, white)' }}>
                          <TrendingUp className="h-5 w-5" style={{ color: 'var(--brand-green)' }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">Crece contigo</h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Mide tu progreso y supérate cada día.</p>
                        </div>
                      </div>
                    </section>

                    {/* TWO GRIDS REQUESTED BY USER */}
                    
                    {/* Course Grid */}
                    <section className="rounded-3xl bg-white shadow-card border border-border/40 p-6 space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Todos los Cursos Disponibles</h2>
                        <p className="text-xs text-muted-foreground mt-1">Inscríbete en los cursos generales y de carrera para acceder a sus grupos de estudio.</p>
                      </div>

                      <div className="space-y-6">
                        {/* Sub-section: Cursos Generales */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cursos Generales</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {generalCourses.map((course) => {
                              const IconComponent = course.icon;
                              const isEnrolled = enrolledCourses.includes(course.name);
                              return (
                                <div 
                                  key={course.name}
                                  onClick={() => setSelectedCourse(course.name)}
                                  className="group relative rounded-2xl border border-border/60 bg-white p-5 hover:border-gray-300 hover:shadow-soft transition-all duration-200 cursor-pointer flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: course.bg }}>
                                        <IconComponent className="h-5 w-5" style={{ color: course.color }} />
                                      </div>
                                      {isEnrolled && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 animate-in fade-in zoom-in-95">
                                          <Check className="h-3 w-3" />
                                          <span>Inscrito</span>
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-bold text-sm text-foreground leading-snug group-hover:text-[color:var(--brand-purple)] transition-colors">{course.name}</h4>
                                    <p className="text-[10px] font-medium text-muted-foreground mt-1">{course.area}</p>
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEnrollCourse(course.name);
                                    }}
                                    className={`mt-4 w-full py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                                      isEnrolled 
                                        ? 'bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20' 
                                        : 'bg-[color:var(--brand-purple)] text-white hover:opacity-95 shadow-soft border-transparent'
                                    }`}
                                  >
                                    {isEnrolled ? 'Desinscribirse' : 'Inscribirse'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Sub-section: Cursos Filtro de Carrera */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cursos Filtro de Carrera</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {filterCourses.map((course) => {
                              const IconComponent = course.icon;
                              const isEnrolled = enrolledCourses.includes(course.name);
                              return (
                                <div 
                                  key={course.name}
                                  onClick={() => setSelectedCourse(course.name)}
                                  className="group relative rounded-2xl border border-border/60 bg-white p-5 hover:border-gray-300 hover:shadow-soft transition-all duration-200 cursor-pointer flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="h-10 w-10 rounded-xl flex items-center justify-center animate-in fade-in" style={{ backgroundColor: course.bg }}>
                                        <IconComponent className="h-5 w-5" style={{ color: course.color }} />
                                      </div>
                                      {isEnrolled && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 animate-in fade-in zoom-in-95">
                                          <Check className="h-3 w-3" />
                                          <span>Inscrito</span>
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-bold text-sm text-foreground leading-snug group-hover:text-[color:var(--brand-green)] transition-colors">{course.name}</h4>
                                    <p className="text-[10px] font-medium text-muted-foreground mt-1">{course.area}</p>
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEnrollCourse(course.name);
                                    }}
                                    className={`mt-4 w-full py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                                      isEnrolled 
                                        ? 'bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20' 
                                        : 'bg-[color:var(--brand-green)] text-white hover:opacity-95 shadow-soft border-transparent'
                                    }`}
                                  >
                                    {isEnrolled ? 'Desinscribirse' : 'Inscribirse'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Group Grid */}
                    <section className="rounded-3xl bg-white shadow-card border border-border/40 p-6 space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-foreground">Todos los Grupos Disponibles</h2>
                          <p className="text-xs text-muted-foreground mt-1">Únete a los grupos activos o ingresa al chat para chatear con compañeros.</p>
                        </div>
                        <button 
                          onClick={() => { setSelectedCourse('Programming Fundamentals'); setShowCreateGroup(true); }}
                          className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 shadow-soft hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Crear Grupo</span>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableGroups.map((group) => {
                          const isJoined = joinedGroups.includes(group.name);
                          const restrictionError = getGroupRestrictionError(group);

                          return (
                            <div 
                              key={group.id}
                              className={`relative rounded-2xl border p-5 transition bg-white flex flex-col justify-between ${
                                restrictionError 
                                  ? 'border-border/40 opacity-75 hover:opacity-100' 
                                  : 'border-border/60 hover:shadow-soft'
                              }`}
                            >
                              <div>
                                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--brand-purple)]/10 text-[color:var(--brand-purple)]">
                                    {group.courseName}
                                  </span>
                                  {group.type === 'subaula' ? (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50">
                                      Sección Exclusiva
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/50">
                                      Grupo Común
                                    </span>
                                  )}
                                  {isJoined && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">
                                      Miembro
                                    </span>
                                  )}
                                </div>
                                
                                <h3 className="font-bold text-foreground text-sm leading-snug">{group.name}</h3>
                                <p className="text-[10px] text-muted-foreground mt-1">{group.members} miembros</p>
                                <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-3">{group.description}</p>

                                {restrictionError && (
                                  <div className="mt-3 p-2 bg-rose-50/50 border border-rose-100 rounded-xl flex items-start gap-1.5 text-[9px] text-rose-500 font-bold leading-tight select-none">
                                    <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    <span>{restrictionError}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="mt-4 pt-3 border-t border-border/40 flex gap-2">
                                <button 
                                  onClick={() => handleJoinGroup(group.name)}
                                  disabled={!!restrictionError}
                                  className={`flex-1 py-2 rounded-xl font-bold text-[10px] transition-all text-center ${
                                    isJoined
                                      ? 'border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 cursor-pointer'
                                      : restrictionError
                                        ? 'border border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed opacity-60'
                                        : 'border border-[color:var(--brand-blue)] text-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/5 bg-transparent cursor-pointer'
                                  }`}
                                >
                                  {isJoined ? 'Salir' : 'Unirse'}
                                </button>

                                {isJoined && (
                                  <button 
                                    onClick={() => handleOpenChat(group.name)}
                                    className="px-3 py-2 rounded-xl bg-gradient-brand text-white font-bold text-[10px] hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-soft"
                                  >
                                    <MessageSquare className="h-3 w-3" />
                                    <span>Chat</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    {/* CTA Bottom Banner */}
                    <section className="rounded-3xl bg-gradient-to-r from-[color:var(--brand-blue)]/10 via-[color:var(--brand-purple)]/10 to-[color:var(--brand-green)]/10 border border-border/40 p-6 sm:p-8 flex flex-wrap items-center gap-6 justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">¿No encuentras lo que buscas?</h3>
                        <p className="text-sm text-muted-foreground mt-1">Crea tu propio grupo y reúne a los compañeros ideales para estudiar juntos.</p>
                        
                        <button 
                          onClick={() => { setSelectedCourse('Programming Fundamentals'); setShowCreateGroup(true); }}
                          className="mt-4 px-5 py-2.5 rounded-xl bg-white border border-border font-semibold text-sm inline-flex items-center gap-2 hover:shadow-soft hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer text-foreground"
                        >
                          Crear grupo 
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </section>

                  </div>

                  {/* Right Column: "Mis cursos" and "Mis grupos" sidebars matching mockup exactly */}
                  <aside className="space-y-6">
                    <section className="rounded-3xl bg-white shadow-card border border-border/40 p-6 xl:sticky xl:top-24 space-y-6">
                      
                      {/* Mis Cursos Quicklist */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="font-bold text-foreground text-sm">Mis cursos</h2>
                          {enrolledCourses.length > 0 && (
                            <button 
                              onClick={() => { setSelectedCourse(enrolledCourses[0]); }} 
                              className="text-[11px] font-medium text-[color:var(--brand-blue)] hover:underline cursor-pointer bg-transparent border-none"
                            >
                              Ver todos
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {enrolledCourses.length === 0 ? (
                            <div className="text-center py-4 px-3 rounded-2xl border border-dashed border-border/60 bg-muted/10 text-muted-foreground">
                              <BookOpen className="h-4 w-4 mx-auto mb-1.5 text-muted-foreground/60" />
                              <p className="text-[10px] font-medium leading-relaxed text-center">No estás inscrito en ningún curso.</p>
                            </div>
                          ) : (
                            enrolledCourses.map((courseName) => {
                              const allCourses = [...generalCourses, ...filterCourses];
                              const course = allCourses.find(c => c.name === courseName) || {
                                name: courseName,
                                icon: BookOpen,
                                color: '#6b7280',
                                bg: 'rgba(107, 114, 128, 0.15)'
                              };
                              const IconComponent = course.icon;
                              return (
                                <div 
                                  key={course.name}
                                  onClick={() => setSelectedCourse(course.name)}
                                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/60 hover:shadow-soft hover:border-gray-300 transition cursor-pointer bg-white"
                                >
                                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: course.bg }}>
                                    <IconComponent className="h-4.5 w-4.5" style={{ color: course.color }} />
                                  </div>
                                  <span className="text-xs font-medium text-foreground truncate">{course.name}</span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Mis Grupos Quicklist */}
                      <div className="border-t border-border/40 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="font-bold text-foreground text-sm">Mis grupos</h2>
                          {myGroups.length > 0 && (
                            <button 
                              onClick={() => { setActiveTab('grupos'); }} 
                              className="text-[11px] font-medium text-[color:var(--brand-blue)] hover:underline cursor-pointer bg-transparent border-none"
                            >
                              Ver todos
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {myGroups.length === 0 ? (
                            <div className="text-center py-4 px-3 rounded-2xl border border-dashed border-border/60 bg-muted/10 text-muted-foreground">
                              <Users className="h-4 w-4 mx-auto mb-1.5 text-muted-foreground/60" />
                              <p className="text-[10px] font-medium leading-relaxed text-center">No te has unido a ningún grupo.</p>
                            </div>
                          ) : (
                            myGroups.map((group) => (
                              <div 
                                key={group.id}
                                onClick={() => handleOpenChat(group.name)}
                                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/60 hover:shadow-soft hover:border-gray-300 transition cursor-pointer bg-white"
                              >
                                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[color:var(--brand-purple)]/10 text-[color:var(--brand-purple)] shrink-0 font-bold text-xs">
                                  {getInitials(group.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">{group.name}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">{group.courseName}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </section>
                  </aside>

                </div>
              )}
            </>
          )}

          {/* VIEW: STEP 4 (CREAR O UNIRSE A UN GRUPO DE CHAT) */}
          {selectedCourse && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
              
              {/* Back Button */}
              <button 
                onClick={() => setSelectedCourse(null)}
                className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-2"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span>Volver a Cursos</span>
              </button>

              {/* Course Header Banner */}
              {(() => {
                const allCourses = [...generalCourses, ...filterCourses];
                const course = allCourses.find(c => c.name === selectedCourse) || {
                  name: selectedCourse,
                  area: 'Área General',
                  icon: BookOpen,
                  color: '#6b7280',
                  bg: 'rgba(107, 114, 128, 0.15)'
                };
                const IconComponent = course.icon;
                const isEnrolled = enrolledCourses.includes(selectedCourse);
                const currentAula = userSubaulas[selectedCourse];

                // Mock group lists
                const courseGroups = availableGroups.filter(g => g.courseName === selectedCourse);
                const subaulaGroups = courseGroups.filter(g => g.type === 'subaula');
                const normalGroups = courseGroups.filter(g => g.type === 'normal');

                return (
                  <div className="space-y-6">
                    {/* Header Card */}
                    <div className="rounded-3xl border border-border/60 bg-white p-6 sm:p-8 shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-soft" style={{ backgroundColor: course.bg }}>
                          <IconComponent className="h-7 w-7" style={{ color: course.color }} />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
                            {course.area}
                          </span>
                          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight mt-1">{selectedCourse}</h1>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {isEnrolled 
                              ? `Inscrito en el curso • Sección actual: ${currentAula ? currentAula.replace('Aula 1', 'Aula 101').replace('Aula 2', 'Aula 102').replace('Aula 3', 'Aula 103').replace('Aula 4', 'Aula 104') : 'Sin sección'}`
                              : 'No estás inscrito en este curso todavía'
                            }
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEnrollCourse(selectedCourse)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-soft border ${
                          isEnrolled
                            ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100/50'
                            : 'bg-[color:var(--brand-purple)] text-white border-transparent hover:opacity-90'
                        }`}
                      >
                        {isEnrolled ? 'Desinscribirse del curso' : 'Inscribirse en el curso'}
                      </button>
                    </div>

                    {/* Subaulas Grid (1 to 4) */}
                    <div className="rounded-3xl border border-border/40 bg-white p-6 sm:p-8 shadow-card space-y-4">
                      <div className="text-left">
                        <h2 className="text-base font-extrabold text-foreground">Aulas del Curso (Secciones)</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Para participar en grupos de aula, debes estar registrado en una de las secciones (Se permite máximo una sección por curso).
                        </p>
                      </div>

                      {!isEnrolled && (
                        <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 text-center text-xs text-rose-500 font-bold flex items-center justify-center gap-2">
                          <Lock className="h-4 w-4" />
                          <span>Debes inscribirte en el curso arriba para poder seleccionar tu aula.</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { key: 'Aula 1', label: 'Aula 101', count: 18 },
                          { key: 'Aula 2', label: 'Aula 102', count: 14 },
                          { key: 'Aula 3', label: 'Aula 103', count: 12 },
                          { key: 'Aula 4', label: 'Aula 104', count: 16 }
                        ].map((aulaObj) => {
                          const isActive = currentAula === aulaObj.key;
                          return (
                            <div 
                              key={aulaObj.key}
                              className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                                !isEnrolled 
                                  ? 'border-border/40 bg-muted/20 opacity-50' 
                                  : isActive
                                    ? 'border-[color:var(--brand-green)] bg-[color:var(--brand-green)]/5 shadow-soft'
                                    : 'border-border/60 bg-white hover:border-gray-300 hover:shadow-soft'
                              }`}
                            >
                              <div className="text-left">
                                <h3 className="font-extrabold text-sm text-foreground">{aulaObj.label}</h3>
                                <p className="text-[10px] text-muted-foreground mt-1">{aulaObj.count} alumnos inscritos</p>
                              </div>

                              {isEnrolled && (
                                <button
                                  onClick={() => {
                                    setUserSubaulas({
                                      ...userSubaulas,
                                      [selectedCourse]: aulaObj.key
                                    });
                                  }}
                                  disabled={isActive}
                                  className={`mt-4 w-full py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center ${
                                    isActive
                                      ? 'bg-[color:var(--brand-green)] text-white border-transparent'
                                      : 'border border-[color:var(--brand-purple)] text-[color:var(--brand-purple)] hover:bg-[color:var(--brand-purple)]/5 bg-transparent'
                                  }`}
                                >
                                  {isActive ? 'Mi Aula' : currentAula ? 'Cambiar a esta Aula' : 'Ingresar a esta Aula'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Study Groups in this Course */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <h2 className="text-xl font-extrabold text-foreground">Grupos de Estudio del Curso</h2>
                          <p className="text-xs text-muted-foreground mt-0.5">Únete a grupos compartidos o de sección para colaborar.</p>
                        </div>
                        {isEnrolled && (
                          <button 
                            onClick={() => setShowCreateGroup(true)}
                            className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 shadow-soft hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                          >
                            <Plus className="h-4.5 w-4.5" />
                            <span>Crear grupo</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Grupos de Aula Section */}
                        <div className="rounded-3xl border border-border/40 bg-white p-6 space-y-4 shadow-card">
                          <div className="text-left">
                            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                              Grupos de Aula (Sección Exclusiva)
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Solo alumnos en la sección correspondiente pueden unirse.</p>
                          </div>

                          {subaulaGroups.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border/40">
                              No hay grupos de aula creados en este curso.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {subaulaGroups.map((group) => {
                                const isJoined = joinedGroups.includes(group.name);
                                const restrictionError = getGroupRestrictionError(group);
                                const aulaLabel = group.subaula === 'Aula 1' ? 'Aula 101' : (group.subaula === 'Aula 2' ? 'Aula 102' : (group.subaula === 'Aula 3' ? 'Aula 103' : 'Aula 104'));

                                return (
                                  <div key={group.id} className="rounded-xl border border-border/60 p-4 bg-white flex flex-col justify-between hover:shadow-soft transition-all text-left">
                                    <div className="flex justify-between items-start gap-3">
                                      <div>
                                        <h4 className="font-bold text-xs text-foreground leading-tight">{group.name}</h4>
                                        <p className="text-[10px] text-muted-foreground mt-1">Sección: <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md text-[9px]">{aulaLabel}</span> • {group.members} miembros</p>
                                        <p className="text-[11px] text-muted-foreground mt-2.5 leading-normal line-clamp-2">{group.description}</p>
                                      </div>
                                    </div>

                                    {restrictionError && (
                                      <p className="text-[9px] text-rose-500 font-bold mt-3.5 flex items-center gap-1 select-none bg-rose-50/50 p-2 rounded-lg border border-rose-100/60 leading-tight">
                                        <Lock className="h-3 w-3 shrink-0" />
                                        <span>{restrictionError}</span>
                                      </p>
                                    )}

                                    <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center gap-2">
                                      <button
                                        onClick={() => handleJoinGroup(group.name)}
                                        disabled={!!restrictionError}
                                        className={`flex-1 py-1.5 rounded-xl font-bold text-[10px] transition-all text-center ${
                                          isJoined
                                            ? 'border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 cursor-pointer'
                                            : restrictionError
                                              ? 'border border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed opacity-60'
                                              : 'border border-[color:var(--brand-blue)] text-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/5 bg-transparent cursor-pointer'
                                        }`}
                                      >
                                        {isJoined ? 'Salir' : 'Unirse'}
                                      </button>

                                      {isJoined && (
                                        <button
                                          onClick={() => handleOpenChat(group.name)}
                                          className="px-3 py-1.5 rounded-xl bg-gradient-brand text-white font-bold text-[10px] hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-soft"
                                        >
                                          <MessageSquare className="h-3 w-3" />
                                          <span>Chat</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Grupos Comunes Section */}
                        <div className="rounded-3xl border border-border/40 bg-white p-6 space-y-4 shadow-card">
                          <div className="text-left">
                            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                              Grupos Comunes (Abiertos)
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Cualquier alumno inscrito en el curso puede unirse libremente.</p>
                          </div>

                          {normalGroups.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border/40">
                              No hay grupos comunes creados para este curso.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {normalGroups.map((group) => {
                                const isJoined = joinedGroups.includes(group.name);
                                const restrictionError = getGroupRestrictionError(group);

                                return (
                                  <div key={group.id} className="rounded-xl border border-border/60 p-4 bg-white flex flex-col justify-between hover:shadow-soft transition-all text-left">
                                    <div className="flex justify-between items-start gap-3">
                                      <div>
                                        <h4 className="font-bold text-xs text-foreground leading-tight">{group.name}</h4>
                                        <p className="text-[10px] text-muted-foreground mt-1">Categoría: <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md text-[9px]">General</span> • {group.members} miembros</p>
                                        <p className="text-[11px] text-muted-foreground mt-2.5 leading-normal line-clamp-2">{group.description}</p>
                                      </div>
                                    </div>

                                    {restrictionError && (
                                      <p className="text-[9px] text-rose-500 font-bold mt-3.5 flex items-center gap-1 select-none bg-rose-50/50 p-2 rounded-lg border border-rose-100/60 leading-tight">
                                        <Lock className="h-3 w-3 shrink-0" />
                                        <span>{restrictionError}</span>
                                      </p>
                                    )}

                                    <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center gap-2">
                                      <button
                                        onClick={() => handleJoinGroup(group.name)}
                                        disabled={!!restrictionError}
                                        className={`flex-1 py-1.5 rounded-xl font-bold text-[10px] transition-all text-center ${
                                          isJoined
                                            ? 'border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 cursor-pointer'
                                            : restrictionError
                                              ? 'border border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed opacity-60'
                                              : 'border border-[color:var(--brand-blue)] text-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/5 bg-transparent cursor-pointer'
                                        }`}
                                      >
                                        {isJoined ? 'Salir' : 'Unirse'}
                                      </button>

                                      {isJoined && (
                                        <button
                                          onClick={() => handleOpenChat(group.name)}
                                          className="px-3 py-1.5 rounded-xl bg-gradient-brand text-white font-bold text-[10px] hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-soft"
                                        >
                                          <MessageSquare className="h-3 w-3" />
                                          <span>Chat</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW: HERRAMIENTAS (STEP 5) */}
          {activeTab === 'herramientas' && (
            <div className="space-y-6">
              
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Herramientas Institucionales</h1>
                <p className="text-xs text-muted-foreground mt-1">Accede a los servicios y herramientas que UTEC pone a tu disposición.</p>
              </div>

              {/* Step 5 Reservation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Tool 1 */}
                <div className="rounded-2xl border border-border/60 bg-white p-6 flex flex-col justify-between hover:shadow-soft transition-all">
                  <div>
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(254, 123, 2, 0.15)' }}>
                      <Calendar className="h-6 w-6" style={{ color: '#FE7B02' }} />
                    </div>
                    <h3 className="font-bold text-sm text-foreground">Reserva de Aulas</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Reserva aulas asignadas para estudio en grupo o repasos académicos.
                    </p>
                  </div>
                  <button 
                    onClick={() => openReservationForm('Reserva de Aulas')}
                    className="mt-6 w-full py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer bg-white"
                  >
                    Reservar aula
                  </button>
                </div>

                {/* Tool 2 */}
                <div className="rounded-2xl border border-border/60 bg-white p-6 flex flex-col justify-between hover:shadow-soft transition-all">
                  <div>
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(254, 123, 2, 0.15)' }}>
                      <DoorClosed className="h-6 w-6" style={{ color: '#FE7B02' }} />
                    </div>
                    <h3 className="font-bold text-sm text-foreground">Reserva de Salas de Estudio</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Reserva salas completamente equipadas con pizarras y pantallas para tus reuniones.
                    </p>
                  </div>
                  <button 
                    onClick={() => openReservationForm('Reserva de Salas de Estudio')}
                    className="mt-6 w-full py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer bg-white"
                  >
                    Reservar sala
                  </button>
                </div>

                {/* Tool 3 */}
                <div className="rounded-2xl border border-border/60 bg-white p-6 flex flex-col justify-between hover:shadow-soft transition-all">
                  <div>
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(254, 123, 2, 0.15)' }}>
                      <Laptop className="h-6 w-6" style={{ color: '#FE7B02' }} />
                    </div>
                    <h3 className="font-bold text-sm text-foreground">Reserva de Equipos</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Solicita y reserva equipos tecnológicos o kits de laboratorio para tus proyectos.
                    </p>
                  </div>
                  <button 
                    onClick={() => openReservationForm('Reserva de Equipos')}
                    className="mt-6 w-full py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer bg-white"
                  >
                    Reservar equipo
                  </button>
                </div>

                {/* Tool 4 */}
                <div className="rounded-2xl border border-border/60 bg-white p-6 flex flex-col justify-between hover:shadow-soft transition-all">
                  <div>
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(254, 123, 2, 0.15)' }}>
                      <BookOpen className="h-6 w-6" style={{ color: '#FE7B02' }} />
                    </div>
                    <h3 className="font-bold text-sm text-foreground">Biblioteca UTEC</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Consulta la disponibilidad de libros y reserva cubículos de estudio en la biblioteca central.
                    </p>
                  </div>
                  <button 
                    onClick={() => openReservationForm('Biblioteca UTEC')}
                    className="mt-6 w-full py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer bg-white"
                  >
                    Consultar biblioteca
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* VIEW: HISTORIAL DE RESERVAS */}
          {activeTab === 'historial' && (
            <div className="max-w-3xl mx-auto space-y-6">
              
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Reservas y Asistencia</h1>
                <p className="text-xs text-muted-foreground mt-1">Monitorea tus reservas activas e historial de reservas anteriores.</p>
              </div>

              {/* Tabs Section matching prototype */}
              <div className="rounded-3xl border bg-white p-6 sm:p-8 shadow-card border-border/40">
                
                {/* Tabs Headers */}
                <div className="flex border-b mb-6 border-border/60">
                  <button 
                    onClick={() => setActiveBookingTab('prox')}
                    className={`pb-4 px-4 text-xs font-bold transition-all border-b-2 relative cursor-pointer ${
                      activeBookingTab === 'prox' 
                        ? 'border-[color:var(--brand-purple)] text-[color:var(--brand-purple)]' 
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Próximas
                  </button>
                  <button 
                    onClick={() => setActiveBookingTab('comp')}
                    className={`pb-4 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                      activeBookingTab === 'comp' 
                        ? 'border-[color:var(--brand-purple)] text-[color:var(--brand-purple)]' 
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Completadas
                  </button>
                  <button 
                    onClick={() => setActiveBookingTab('canc')}
                    className={`pb-4 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                      activeBookingTab === 'canc' 
                        ? 'border-[color:var(--brand-purple)] text-[color:var(--brand-purple)]' 
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Canceladas
                  </button>
                </div>

                {/* Tab content */}
                {activeBookingTab === 'canc' && (
                  <div className="space-y-4">
                    {bookings.filter(b => b.status === 'no-show').map((booking) => (
                      <div 
                        key={booking.id}
                        className="rounded-2xl border border-border/60 p-5 relative overflow-hidden animate-in fade-in-0 duration-200 bg-white shadow-soft"
                      >
                        {/* Gray border on left */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gray-300"></div>

                        <div className="flex justify-between items-start gap-4 pl-2">
                          <div>
                            <h3 className="font-bold text-sm text-foreground">{booking.title}</h3>
                            <p className="text-[11px] mt-1 text-muted-foreground">{booking.group}</p>
                            
                            <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {booking.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {booking.time}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 shrink-0 border border-gray-200">
                            Cancelada
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upcoming bookings */}
                {activeBookingTab === 'prox' && (
                  <div className="space-y-4 text-center py-8">
                    {bookings.filter(b => b.status === 'pending').length === 0 ? (
                      <p className="text-xs text-muted-foreground">No tienes próximas reservas agendadas.</p>
                    ) : (
                      <div className="space-y-4 text-left">
                        {bookings.filter(b => b.status === 'pending').map(b => (
                          <div key={b.id} className="rounded-2xl border border-border/60 bg-white p-5 flex justify-between items-center shadow-soft">
                            <div>
                              <h3 className="font-bold text-sm text-foreground">{b.title}</h3>
                              <p className="text-[11px] text-muted-foreground">{b.group}</p>
                              <p className="text-[11px] mt-2 text-muted-foreground">{b.date} • {b.time}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-100">
                              Confirmada
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Completed bookings */}
                {activeBookingTab === 'comp' && (
                  <div className="text-center py-8">
                    <p className="text-xs text-muted-foreground">No hay reservas completadas recientemente en tu historial.</p>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* VIEW: COMUNIDAD Y CALIFICACIONES (OUTSIDE CHAT MODAL, ANONYMOUS SYSTEM) */}
          {activeTab === 'comunidad' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Compañeros de UTEC</h1>
                <p className="text-xs text-muted-foreground mt-1">Califica de forma 100% anónima la colaboración y aporte académico de otros estudiantes.</p>
              </div>

              {/* Search Bar for members */}
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  value={communitySearch}
                  onChange={(e) => setCommunitySearch(e.target.value)}
                  placeholder="Buscar compañeros por nombre o carrera..." 
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-border focus:border-[color:var(--brand-purple)] focus:outline-none text-xs shadow-soft" 
                  type="text" 
                />
              </div>

              {loadingCommunity ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[color:var(--brand-purple)]" />
                  <span className="text-xs font-medium text-muted-foreground">Cargando compañeros...</span>
                </div>
              ) : filteredCommunity.length === 0 ? (
                <div className="rounded-3xl border border-border bg-white p-12 text-center max-w-xl mx-auto shadow-soft flex flex-col items-center justify-center animate-in fade-in duration-200">
                  <div className="h-14 w-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-4">
                    <Users className="h-7 w-7 text-rose-500 animate-pulse" />
                  </div>
                  <h3 className="font-extrabold text-sm text-foreground">No tienes compañeros visibles</h3>
                  <p className="text-xs text-muted-foreground mt-2 max-w-sm leading-relaxed">
                    Solo puedes ver a los estudiantes con quienes compartes al menos un grupo de estudio. Únete a un grupo en la sección de grupos o de cursos para interactuar con tus compañeros.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredCommunity.map((member) => {
                    const memberGroups = getMemberGroups(member.username);

                    return (
                      <div 
                        key={member.id || member.username}
                        className="rounded-3xl border border-border/60 bg-white p-6 shadow-card hover:shadow-soft hover:border-gray-300 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-extrabold shadow-soft select-none shrink-0">
                              {getInitials(member.username)}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-extrabold text-xs text-foreground truncate">{formatName(member.username)}</h3>
                              <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                            </div>
                          </div>

                          <div className="mt-4 space-y-2.5 pt-3 border-t border-border/40 text-[11px]">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground font-medium">Carrera:</span>
                              <span className="font-semibold text-foreground truncate max-w-[150px]">{member.career || 'No especificada'}</span>
                            </div>

                            <div className="flex justify-between items-start gap-2">
                              <span className="text-muted-foreground font-medium shrink-0">Grupos de Estudio:</span>
                              <div className="text-right flex flex-wrap gap-1 justify-end max-w-[160px]">
                                {memberGroups.map(gName => {
                                  const userIsJoined = joinedGroups.includes(gName);
                                  return (
                                    <span 
                                      key={gName} 
                                      className={`inline-block text-[9px] px-1.5 py-0.5 rounded-md border font-semibold ${
                                        userIsJoined 
                                          ? 'bg-green-50 text-green-700 border-green-200 shadow-xs' 
                                          : 'bg-muted/60 text-muted-foreground border-border/40'
                                      }`}
                                      title={userIsJoined ? 'Grupo compartido' : 'Grupo de este compañero'}
                                    >
                                      {gName.replace('Grupo de ', '')}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground font-medium">Calificación Promedio:</span>
                              <div className="flex items-center gap-1 font-semibold text-foreground">
                                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
                                <span>{member.averageRating ? member.averageRating.toFixed(1) : '0.0'}</span>
                                <span className="text-[9px] text-muted-foreground">({member.ratingCount || 0} calificaciones)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-3 border-t border-border/40">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-muted-foreground font-bold">Tu calificación (Anónima):</span>
                              <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1 select-none text-[9px]">
                                <span className="h-1 w-1 rounded-full bg-green-500"></span>
                                Grupo compartido
                              </span>
                            </div>

                            <div className="flex items-center gap-1 animate-in slide-in-from-bottom-2 duration-250">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const filled = star <= (member.userRating || 0);
                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRateCommunityUser(member.id, star)}
                                    className={`p-0.5 hover:scale-125 active:scale-95 transition-all cursor-pointer bg-transparent border-none ${
                                      filled ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'
                                    }`}
                                    title={`Calificar con ${star} estrellas`}
                                  >
                                    <Star className={`h-5 w-5 ${filled ? 'fill-amber-400' : 'fill-transparent'}`} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW: MIS CURSOS (DEDICATED PAGE FROM LEFT SIDEBAR) */}
          {activeTab === 'cursos' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Mis Cursos Inscritos</h1>
                <p className="text-xs text-muted-foreground mt-1">Accede a tus cursos activos y sus opciones de colaboración.</p>
              </div>

              {enrolledCourses.length === 0 ? (
                <div className="text-center py-16 rounded-3xl border border-dashed border-border bg-white shadow-soft space-y-4">
                  <BookOpen className="h-10 w-10 text-muted-foreground mx-auto animate-pulse" />
                  <div>
                    <h3 className="font-bold text-sm text-foreground">No estás inscrito en ningún curso</h3>
                    <p className="text-xs text-muted-foreground mt-1">Explora los cursos disponibles en el inicio para unirte a ellos.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('inicio')}
                    className="px-4 py-2 rounded-xl border border-border bg-white hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
                  >
                    Ver Cursos Disponibles
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {enrolledCourses.map((courseName) => {
                    const allCourses = [...generalCourses, ...filterCourses];
                    const course = allCourses.find(c => c.name === courseName) || {
                      name: courseName,
                      area: 'Área General',
                      icon: BookOpen,
                      color: '#6b7280',
                      bg: 'rgba(107, 114, 128, 0.15)'
                    };
                    const IconComponent = course.icon;
                    return (
                      <div 
                        key={courseName}
                        onClick={() => setSelectedCourse(courseName)}
                        className="group relative rounded-2xl border border-border/60 bg-white p-5 hover:border-gray-300 hover:shadow-soft transition-all duration-200 cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: course.bg }}>
                            <IconComponent className="h-5 w-5" style={{ color: course.color }} />
                          </div>
                          <h4 className="font-bold text-sm text-foreground leading-snug group-hover:text-[color:var(--brand-purple)] transition-colors">{courseName}</h4>
                          <p className="text-[10px] font-medium text-muted-foreground mt-1">{course.area}</p>

                          <div className="mt-3 pt-3 border-t border-border/40 text-[10px] space-y-1">
                            <label className="block text-muted-foreground font-bold text-[9px] uppercase tracking-wider text-left">Subaula / Sección:</label>
                            <select
                              value={userSubaulas[courseName] || 'Aula 1'}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                setUserSubaulas({
                                  ...userSubaulas,
                                  [courseName]: e.target.value
                                });
                              }}
                              className="w-full bg-muted/60 hover:bg-muted border border-border/40 rounded-lg px-2.5 py-1.5 font-bold text-foreground text-[10px] focus:outline-none transition cursor-pointer"
                            >
                              <option value="Aula 1">Aula 101</option>
                              <option value="Aula 2">Aula 102</option>
                              <option value="Aula 3">Aula 103</option>
                              <option value="Aula 4">Aula 104</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCourse(courseName);
                              setActiveTab('inicio');
                            }}
                            className="w-full py-1.5 rounded-xl text-[10px] font-bold border border-border text-foreground bg-white hover:bg-muted transition-all cursor-pointer text-center"
                          >
                            Ver Detalles
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEnrollCourse(courseName);
                            }}
                            className="w-full py-1.5 rounded-xl text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer text-center"
                          >
                            Desinscribirse
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW: MIS GRUPOS */}
          {activeTab === 'grupos' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Mis Grupos de Estudio</h1>
                  <p className="text-xs text-muted-foreground mt-1">Revisa y chatea con los miembros de tus grupos académicos activos.</p>
                </div>
                <button 
                  onClick={() => { setSelectedCourse('Programming Fundamentals'); setShowCreateGroup(true); }}
                  className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 shadow-soft hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>Crear grupo</span>
                </button>
              </div>

              {myGroups.length === 0 ? (
                <div className="text-center py-16 rounded-3xl border border-dashed border-border bg-white shadow-soft space-y-4">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-bold text-sm text-foreground">No perteneces a ningún grupo</h3>
                    <p className="text-xs text-muted-foreground mt-1">Únete a un grupo en el Inicio o crea uno nuevo.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('inicio')}
                    className="px-4 py-2 rounded-xl border border-border bg-white hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
                  >
                    Ver Grupos Disponibles
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myGroups.map((group) => (
                    <div key={group.id} className="rounded-2xl border border-border/60 bg-white p-6 hover:shadow-soft transition-all flex flex-col justify-between shadow-card">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-extrabold text-base text-foreground">{group.name}</h3>
                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--brand-purple)]/10 text-[color:var(--brand-purple)]">
                              {group.courseName}
                            </span>
                            {group.type === 'subaula' ? (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50">
                                {group.subaula === 'Aula 1' ? 'Aula 101' : (group.subaula === 'Aula 2' ? 'Aula 102' : 'Aula 103')}
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/50">
                                Grupo Común
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{group.members} miembros activos</p>
                        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">{group.description}</p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border/60 flex justify-between items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-green-600 font-bold">
                          <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
                          Estudio activo
                        </span>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleJoinGroup(group.name)}
                            className="px-3 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer bg-white"
                          >
                            Dejar grupo
                          </button>
                          <button 
                            onClick={() => handleOpenChat(group.name)}
                            className="px-4 py-1.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition flex items-center gap-1 cursor-pointer bg-white shadow-soft"
                          >
                            <span>Entrar al chat</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEWS: PLACEHOLDERS (PERFIL, CONFIGURACIÓN) */}
          {activeTab === 'perfil' && (
            <div className="max-w-xl mx-auto rounded-3xl border border-border/60 bg-white p-8 space-y-6 shadow-card">
              {loadingProfile ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[color:var(--brand-purple)]" />
                  <span className="text-sm font-medium text-muted-foreground">Cargando perfil...</span>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-4">
                    <div className="h-24 w-24 rounded-full bg-gradient-brand flex items-center justify-center text-white text-3xl font-extrabold mx-auto shadow-lg select-none">
                  {getInitials(userProfile?.username || user.username)}
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-foreground">
                    {formatName(userProfile?.username || user.username)}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">{userProfile?.email || user.email}</p>
                </div>
              </div>

              {profileSuccessMsg && (
                <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3.5 text-xs text-green-600">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-600">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="career-select" className="text-xs font-semibold text-muted-foreground block text-left">
                    Selecciona tu Carrera Universitaria:
                  </label>
                  <select
                    id="career-select"
                    value={selectedCareer}
                    onChange={(e) => setSelectedCareer(e.target.value)}
                    disabled={savingProfile}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-[color:var(--brand-purple)] focus:ring-1 focus:ring-[color:var(--brand-purple)] outline-none transition-all cursor-pointer"
                  >
                    <option value="">-- Selecciona una carrera --</option>
                    <option value="Ciencias de la Computación">Ciencias de la Computación</option>
                    <option value="Ingeniería Ambiental">Ingeniería Ambiental</option>
                    <option value="Ingeniería Civil">Ingeniería Civil</option>
                    <option value="Ingeniería de la Energía">Ingeniería de la Energía</option>
                    <option value="Sistemas de la Información">Sistemas de la Información</option>
                  </select>
                </div>

                <div className="rounded-xl p-4 text-xs border border-border/60 bg-muted/40 text-muted-foreground flex justify-between items-center shadow-soft">
                  <span className="flex items-center gap-1.5 font-medium">
                    <GraduationCap className="h-4 w-4 text-[color:var(--brand-purple)]" />
                    Carrera Actual:
                  </span>
                  <span className="font-bold text-foreground">
                    {userProfile?.career || 'No configurada'}
                  </span>
                </div>

                <div className="rounded-xl p-4 text-xs border border-border/60 bg-muted/40 text-muted-foreground flex justify-between items-center shadow-soft">
                  <span className="flex items-center gap-1.5 font-medium">
                    <User className="h-4 w-4 text-[color:var(--brand-green)]" />
                    Rol en UTEC Conexión:
                  </span>
                  <span className="font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-100">
                    {userProfile?.role === 'ROLE_ADMIN' ? 'Administrador' : 
                     userProfile?.role === 'ROLE_ORGANIZER' ? 'Organizador' : 'Estudiante Autorizado (UTEC)'}
                  </span>
                </div>

                <div className="rounded-xl p-4 text-xs border border-border/60 bg-muted/40 text-muted-foreground flex flex-col gap-3 shadow-soft">
                  <div className="flex justify-between items-center w-full">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      Calificación (Co-evaluación):
                    </span>
                    {userProfile && userProfile.ratingCount !== undefined && userProfile.ratingCount >= 3 ? (
                      <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100 flex items-center gap-1">
                        {userProfile.averageRating ? userProfile.averageRating.toFixed(1) : '0.0'} ★
                      </span>
                    ) : (
                      <span className="font-bold text-gray-500 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-200">
                        No disponible
                      </span>
                    )}
                  </div>
                  
                  {userProfile && userProfile.ratingCount !== undefined && userProfile.ratingCount >= 3 ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const rating = userProfile.averageRating || 0;
                          const filled = star <= Math.round(rating);
                          return (
                            <Star 
                              key={star} 
                              className={`h-4 w-4 ${filled ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-transparent'}`} 
                            />
                          );
                        })}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Basado en {userProfile.ratingCount} calificaciones.
                      </span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                      No tiene suficientes calificaciones
                      <span className="block mt-1 font-normal text-muted-foreground/85">
                        (Necesitas al menos 3 calificaciones de compañeros con quienes compartas grupos de aula).
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-brand text-white font-semibold py-3 hover:shadow-card hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin animate-spin-slow" />
                      <span>Guardando cambios...</span>
                    </>
                  ) : (
                    <span>Guardar Perfil</span>
                  )}
                </button>
              </form>
                </>
              )}
            </div>
          )}

          {activeTab === 'configuracion' && (
            <div className="max-w-xl mx-auto rounded-3xl border border-border/60 bg-white p-8 space-y-6 shadow-card">
              <h2 className="text-xl font-bold text-foreground border-b border-border/60 pb-3">Configuración de la Cuenta</h2>
              <div className="space-y-4 text-xs text-muted-foreground">
                <div className="flex justify-between items-center">
                  <span>Notificaciones por Correo:</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-[color:var(--brand-purple)] cursor-pointer" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Recordatorio de Reservas (15 min antes):</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-[color:var(--brand-purple)] cursor-pointer" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Visualización en Light Mode:</span>
                  <input type="checkbox" defaultChecked disabled className="h-4 w-4 accent-[color:var(--brand-purple)]" />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: CREAR GRUPO DE ESTUDIO (STEP 4) */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground mb-1">Crear nuevo grupo</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Crea un grupo de estudio de <strong className="text-foreground">{selectedCourse}</strong> para colaborar con otros alumnos.
            </p>
            
            <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Nombre del Grupo
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ej. Estudio Cálculo 1 - Grupo 4"
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none transition-all"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Tipo de Grupo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewGroupType('normal')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newGroupType === 'normal'
                        ? 'border-[color:var(--brand-purple)] bg-[color:var(--brand-purple)]/5 text-[color:var(--brand-purple)] font-extrabold'
                        : 'border-border text-muted-foreground bg-white hover:bg-muted'
                    }`}
                  >
                    Normal (Abierto)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const userAula = selectedCourse ? userSubaulas[selectedCourse] : null;
                      if (!userAula) {
                        alert("No puedes crear un grupo de aula si no estás en una sección/aula de este curso. Primero debes inscribirte en un aula en la sección 'Mis Cursos'.");
                        return;
                      }
                      setNewGroupType('subaula');
                      setNewGroupSubaula(userAula);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newGroupType === 'subaula'
                        ? 'border-[color:var(--brand-purple)] bg-[color:var(--brand-purple)]/5 text-[color:var(--brand-purple)] font-extrabold'
                        : 'border-border text-muted-foreground bg-white hover:bg-muted'
                    }`}
                  >
                    De Subaula (Exclusivo)
                  </button>
                </div>
              </div>

              {newGroupType === 'subaula' && (
                <div className="animate-in slide-in-from-top-1.5 duration-200 bg-purple-50 border border-purple-200 p-3.5 rounded-xl text-xs text-purple-700 leading-normal">
                  <span className="font-bold flex items-center gap-1.5 mb-1 text-purple-800">
                    <GraduationCap className="h-4 w-4 shrink-0 text-[color:var(--brand-purple)]" />
                    Sección de Creación Exclusiva
                  </span>
                  Este grupo se creará exclusivamente para tu sección asignada: <strong className="text-purple-900 font-extrabold">{selectedCourse && userSubaulas[selectedCourse] === 'Aula 1' ? 'Aula 101' : (selectedCourse && userSubaulas[selectedCourse] === 'Aula 2' ? 'Aula 102' : (selectedCourse && userSubaulas[selectedCourse] === 'Aula 3' ? 'Aula 103' : 'Aula 104'))}</strong>. No es posible crear grupos de subaula para secciones a las que no perteneces.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Descripción (Opcional)
                </label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Ej. Nos reuniremos los martes a resolver prácticas dirigidas..."
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm h-20 transition-all resize-none focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setShowCreateGroup(false);
                    setNewGroupName('');
                    setNewGroupDesc('');
                    setNewGroupType('normal');
                    setNewGroupSubaula('Aula 1');
                  }}
                  className="rounded-xl border border-border text-xs font-semibold px-4 py-2 hover:bg-muted active:scale-95 transition-all cursor-pointer text-foreground bg-white"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="rounded-xl bg-gradient-brand text-white text-xs font-semibold px-4 py-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Crear grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESERVAR HERRAMIENTA (STEP 5) */}
      {showReservationForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground mb-1">{showReservationForm}</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Completa los datos para realizar la reserva en el sistema de UTEC Conexión.
            </p>
            
            <form onSubmit={handleReserveSubmit} className="space-y-4">
              
              {reservationSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mx-auto text-green-600 border border-green-100">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-sm text-green-600">¡Reserva realizada con éxito!</h4>
                  <p className="text-[11px] text-muted-foreground">Redirigiendo a tu historial de reservas...</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5 text-left">
                      Código del Espacio a Reservar
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. A-101, Cubículo 4, Lab-3"
                      value={reserveSpaceCode}
                      onChange={(e) => setReserveSpaceCode(e.target.value)}
                      className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:border-[color:var(--brand-purple)] focus:ring-1 focus:ring-[color:var(--brand-purple)] transition-all bg-white text-foreground"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5 text-left">
                      Grupo de Aula Relacionado
                    </label>
                    <select
                      value={reserveSubaulaGroup}
                      onChange={(e) => {
                        setReserveSubaulaGroup(e.target.value);
                        setReserveError(null);
                      }}
                      className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:border-[color:var(--brand-purple)] focus:ring-1 focus:ring-[color:var(--brand-purple)] transition-all bg-white text-foreground cursor-pointer"
                      required
                    >
                      <option value="">-- Selecciona un grupo de aula --</option>
                      {availableGroups.filter(g => g.type === 'subaula' && joinedGroups.includes(g.name)).length === 0 ? (
                        <option value="" disabled>
                          No estás inscrito en ningún grupo de aula
                        </option>
                      ) : (
                        availableGroups.filter(g => g.type === 'subaula' && joinedGroups.includes(g.name)).map((g) => (
                          <option key={g.id} value={g.name}>
                            {g.name}
                          </option>
                        ))
                      )}
                    </select>
                    {reserveError && (
                      <p className="text-[10px] text-rose-500 font-semibold mt-1.5 text-left">
                        {reserveError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5 text-left">
                      Fecha de Reserva
                    </label>
                    <input
                      type="date"
                      value={reserveDate}
                      onChange={(e) => setReserveDate(e.target.value)}
                      className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:border-[color:var(--brand-purple)] focus:ring-1 focus:ring-[color:var(--brand-purple)] transition-all bg-white text-foreground"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5 text-left">
                      Hora de la Reserva
                    </label>
                    <select
                      value={reserveTime}
                      onChange={(e) => setReserveTime(e.target.value)}
                      className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:border-[color:var(--brand-purple)] focus:ring-1 focus:ring-[color:var(--brand-purple)] transition-all bg-white text-foreground cursor-pointer"
                      required
                    >
                      <option value="10:00 - 12:00">10:00 - 12:00</option>
                      <option value="12:00 - 14:00">12:00 - 14:00</option>
                      <option value="14:00 - 16:00">14:00 - 16:00</option>
                      <option value="16:00 - 18:00">16:00 - 18:00</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setShowReservationForm(null)}
                      className="rounded-xl border border-border text-xs font-semibold px-4 py-2 hover:bg-muted active:scale-95 transition-all cursor-pointer text-foreground bg-white"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="rounded-xl bg-gradient-brand text-white text-xs font-semibold px-4 py-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                    >
                      Confirmar Reserva
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHAT GRUPAL INTERACTIVO */}
      {activeChatGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-white shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-5 border-b border-border/60 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center font-bold text-white text-sm select-none">
                  {getInitials(activeChatGroup)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">{activeChatGroup}</h3>
                  <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping"></span>
                    Chat de Estudio UTEC Conexión
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveChatGroup(null)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl border border-transparent hover:border-border transition cursor-pointer bg-muted/40 hover:bg-muted"
              >
                Cerrar
              </button>
            </div>

            {/* Chat Messages Area with beautiful bubbles */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 min-h-[300px] max-h-[450px] bg-muted/20">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                  <MessageCircle className="h-10 w-10 text-muted-foreground/45 mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-foreground">¡Comienza la conversación!</p>
                  <p className="text-[10px] text-muted-foreground mt-1 max-w-[240px] leading-relaxed">
                    Escribe un mensaje aquí para saludar e iniciar el estudio colaborativo con tus compañeros.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${msg.isMe ? 'ml-auto items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] font-semibold text-muted-foreground mb-1 pl-1 select-none">
                      {msg.sender} • {msg.time}
                    </span>
                    <div 
                      className="rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-soft"
                      style={{ 
                        backgroundColor: msg.isMe ? 'var(--brand-orange)' : '#ffffff', 
                        color: msg.isMe ? '#ffffff' : 'var(--foreground)', 
                        border: msg.isMe ? 'none' : '1px solid #e4e4e7' 
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendChatMessage} className="p-4 border-t border-border/60 flex gap-3 shrink-0 bg-white rounded-b-3xl">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                className="flex-1 rounded-xl border border-border px-4 py-3 text-xs focus:outline-none transition-all text-foreground bg-white"
                required
                autoFocus
              />
              <button 
                type="submit"
                className="px-5 py-3 rounded-xl bg-gradient-brand text-white text-xs font-semibold shadow-soft hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Enviar
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
