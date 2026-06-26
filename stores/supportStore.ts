import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'admin';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface Ticket {
  id: string;
  userId: number;
  subject: string;
  messages: Message[];
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SupportState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  isLoading: boolean;
  isConnectedToHuman: boolean;
  createTicket: (userId: number, subject: string, message: string) => Promise<void>;
  sendMessage: (ticketId: string, text: string) => Promise<void>;
  getTickets: (userId: number) => Promise<Ticket[]>;
  getTicket: (ticketId: string) => Promise<Ticket | null>;
  requestHumanSupport: (ticketId: string) => Promise<void>;
  closeTicket: (ticketId: string) => Promise<void>;
  loadTickets: (userId: number) => Promise<void>;
}

// Enhanced AI Bot responses with categories
const botResponses: { [key: string]: { fr: string; en: string; ar: string } } = {
  // Greetings
  'bonjour|hello|مرحبا|salut|hi|hey': {
    fr: 'Bonjour! 👋 Comment puis-je vous aider aujourd\'hui? Je peux vous assister avec les réservations, les paiements, ou toute autre question sur Ri7la.',
    en: 'Hello! 👋 How can I help you today? I can assist you with bookings, payments, or any other questions about Ri7la.',
    ar: 'مرحباً! 👋 كيف يمكنني مساعدتك اليوم؟ يمكنني مساعدتك في الحجوزات والمدفوعات أو أي أسئلة أخرى حول رحلة.',
  },
  
  // Bookings
  'reservation|réservation|book|booking|حجز|reserver|réserver': {
    fr: '📅 Pour faire une réservation:\n\n1. Allez dans l\'onglet "Explorer"\n2. Choisissez votre ville\n3. Sélectionnez un hôtel, restaurant ou attraction\n4. Cliquez sur "Réserver"\n5. Choisissez la date, l\'heure et le nombre de personnes\n6. Confirmez votre réservation\n\nBesoin d\'aide supplémentaire?',
    en: '📅 To make a booking:\n\n1. Go to the "Explore" tab\n2. Choose your city\n3. Select a hotel, restaurant or attraction\n4. Click "Book now"\n5. Choose date, time and number of guests\n6. Confirm your booking\n\nNeed more help?',
    ar: '📅 لإجراء حجز:\n\n1. انتقل إلى علامة التبويب "استكشف"\n2. اختر مدينتك\n3. اختر فندقاً أو مطعماً أو معلم سياحي\n4. انقر على "احجز الآن"\n5. اختر التاريخ والوقت وعدد الأشخاص\n6. قم بتأكيد حجزك\n\nهل تحتاج إلى مزيد من المساعدة؟',
  },
  
  // Cancel booking
  'annuler|cancel|إلغاء|annulation': {
    fr: '❌ Pour annuler une réservation:\n\n1. Allez dans l\'onglet "Profil"\n2. Cliquez sur "Mes réservations"\n3. Sélectionnez la réservation à annuler\n4. Cliquez sur "Annuler"\n\n⚠️ Note: Les annulations sont gratuites jusqu\'à 24h avant la date prévue.',
    en: '❌ To cancel a booking:\n\n1. Go to the "Profile" tab\n2. Click on "My bookings"\n3. Select the booking to cancel\n4. Click "Cancel"\n\n⚠️ Note: Cancellations are free up to 24 hours before the scheduled date.',
    ar: '❌ لإلغاء حجز:\n\n1. انتقل إلى علامة التبويب "الملف الشخصي"\n2. انقر على "حجوزاتي"\n3. اختر الحجز المراد إلغاؤه\n4. انقر على "إلغاء"\n\n⚠️ ملاحظة: الإلغاء مجاني حتى 24 ساعة قبل التاريخ المحدد.',
  },
  
  // Payments
  'paiement|payment|payer|pay|دفع|carte|card': {
    fr: '💳 Moyens de paiement acceptés:\n\n• Cartes bancaires (Visa, Mastercard)\n• PayPal\n• Paiement en espèces (sur place pour certains établissements)\n\n🔒 Tous les paiements sont sécurisés.\n\nQuestions sur un paiement spécifique?',
    en: '💳 Accepted payment methods:\n\n• Credit cards (Visa, Mastercard)\n• PayPal\n• Cash on site (for some establishments)\n\n🔒 All payments are secure.\n\nQuestions about a specific payment?',
    ar: '💳 طرق الدفع المقبولة:\n\n• بطاقات الائتمان (فيزا، ماستركارد)\n• باي بال\n• الدفع نقداً (في الموقع لبعض المؤسسات)\n\n🔒 جميع المدفوعات آمنة.\n\nهل لديك أسئلة حول دفعة محددة؟',
  },
  
  // Hours
  'horaire|heure|hours|time|ouverture|مواعيد|ساعات': {
    fr: '🕐 Les horaires d\'ouverture varient selon les établissements.\n\nPour voir les horaires d\'un lieu spécifique:\n1. Allez dans "Explorer"\n2. Sélectionnez le lieu\n3. Les horaires sont affichés dans les détails\n\nLes restaurants sont généralement ouverts de 12h à 23h.\nLes attractions sont ouvertes de 9h à 18h.',
    en: '🕐 Opening hours vary by establishment.\n\nTo see hours for a specific place:\n1. Go to "Explore"\n2. Select the place\n3. Hours are shown in the details\n\nRestaurants are typically open from 12 PM to 11 PM.\nAttractions are open from 9 AM to 6 PM.',
    ar: '🕐 تختلف ساعات العمل حسب المؤسسة.\n\nلمعرفة ساعات عمل مكان معين:\n1. انتقل إلى "استكشف"\n2. اختر المكان\n3. تظهر الساعات في التفاصيل\n\nعادة ما تفتح المطاعم من 12 ظهراً إلى 11 مساءً.\nتفتح المعالم السياحية من 9 صباحاً إلى 6 مساءً.',
  },
  
  // Contact
  'contact|support|aide|help|اتصال|مساعدة': {
    fr: '📞 Voici comment nous contacter:\n\n• Email: support@ri7la.com\n• Chat en ligne disponible 24/7\n• Réponse sous 24h maximum\n\nPour une assistance immédiate, continuez à discuter avec moi! Je suis là pour vous aider.',
    en: '📞 Here\'s how to contact us:\n\n• Email: support@ri7la.com\n• Live chat available 24/7\n• Response within 24 hours maximum\n\nFor immediate assistance, keep chatting with me! I\'m here to help.',
    ar: '📞 إليك كيفية الاتصال بنا:\n\n• البريد الإلكتروني: support@ri7la.com\n• الدردشة المباشرة متاحة 24/7\n• الرد في غضون 24 ساعة كحد أقصى\n\nللحصول على مساعدة فورية، استمر في الدردشة معي! أنا هنا للمساعدة.',
  },
  
  // Account
  'compte|account|profil|profile|mot de passe|password|كلمة سر': {
    fr: '👤 Gestion de votre compte:\n\n• Modifier votre profil: Allez dans "Profil"\n• Changer votre mot de passe: Allez dans "Paramètres" > "Sécurité"\n• Voir vos réservations: "Profil" > "Mes réservations"\n\nProblème d\'accès? Décrivez-moi votre situation.',
    en: '👤 Account management:\n\n• Edit your profile: Go to "Profile"\n• Change your password: Go to "Settings" > "Security"\n• View your bookings: "Profile" > "My bookings"\n\nAccess issue? Describe your situation to me.',
    ar: '👤 إدارة حسابك:\n\n• تعديل ملفك الشخصي: انتقل إلى "الملف الشخصي"\n• تغيير كلمة المرور: انتقل إلى "الإعدادات" > "الأمان"\n• عرض حجوزاتك: "الملف الشخصي" > "حجوزاتي"\n\nهل تواجه مشكلة في الوصول؟ صف لي حالتك.',
  },
  
  // Recommendations
  'recommandation|recommend|suggestion|suggérer|أوصي|اقتراح': {
    fr: '🌟 Je vous recommande de visiter:\n\n• Marrakech: La ville rouge, ses souks et la place Jemaa el-Fna\n• Chefchaouen: La perle bleue du Rif\n• Fès: La capitale spirituelle\n• Casablanca: La tour Hassan II\n\nQuel type d\'expérience cherchez-vous? (culture, nature, gastronomie)',
    en: '🌟 I recommend visiting:\n\n• Marrakech: The Red City, its souks and Jemaa el-Fna square\n• Chefchaouen: The Blue Pearl of the Rif\n• Fes: The spiritual capital\n• Casablanca: The Hassan II Tower\n\nWhat type of experience are you looking for? (culture, nature, gastronomy)',
    ar: '🌟 أوصي بزيارة:\n\n• مراكش: المدينة الحمراء وأسواقها وساحة جامع الفنا\n• شفشاون: اللؤلؤة الزرقاء في الريف\n• فاس: العاصمة الروحية\n• الدار البيضاء: برج الحسن الثاني\n\nما نوع التجربة التي تبحث عنها؟ (ثقافة، طبيعة، مطبخ)',
  },
  
  // Cities
  'ville|city|مدينة|marrakech|fes|chefchaouen|casablanca|rabat|tangier': {
    fr: '🏙️ Les villes disponibles sur Ri7la:\n\n• Marrakech - La ville rouge\n• Fès - Capitale spirituelle\n• Chefchaouen - La perle bleue\n• Casablanca - Capitale économique\n• Rabat - Capitale administrative\n• Tanger - Porte de l\'Afrique\n\nCliquez sur "Accueil" pour explorer ces villes!',
    en: '🏙️ Cities available on Ri7la:\n\n• Marrakech - The Red City\n• Fes - Spiritual capital\n• Chefchaouen - The Blue Pearl\n• Casablanca - Economic capital\n• Rabat - Administrative capital\n• Tangier - Gateway to Africa\n\nClick on "Home" to explore these cities!',
    ar: '🏙️ المدن المتاحة على رحلة:\n\n• مراكش - المدينة الحمراء\n• فاس - العاصمة الروحية\n• شفشاون - اللؤلؤة الزرقاء\n• الدار البيضاء - العاصمة الاقتصادية\n• الرباط - العاصمة الإدارية\n• طنجة - بوابة أفريقيا\n\nانقر على "الرئيسية" لاستكشاف هذه المدن!',
  },
  
  // Favorites
  'favori|favorite|favourites|مفضل|fav': {
    fr: '❤️ Pour gérer vos favoris:\n\n• Ajouter: Cliquez sur le ❤️ sur la page d\'un lieu\n• Voir: Allez dans l\'onglet "Favoris"\n• Supprimer: Cliquez sur la corbeille 🗑️\n\nLes favoris sont sauvegardés même hors ligne!',
    en: '❤️ To manage your favorites:\n\n• Add: Click on the ❤️ on a place page\n• View: Go to the "Favorites" tab\n• Remove: Click on the trash can 🗑️\n\nFavorites are saved even offline!',
    ar: '❤️ لإدارة مفضلاتك:\n\n• إضافة: انقر على ❤️ في صفحة المكان\n• عرض: انتقل إلى علامة التبويب "المفضلة"\n• إزالة: انقر على سلة المهملات 🗑️\n\nيتم حفظ المفضلة حتى في وضع عدم الاتصال!',
  },
  
  // Map/Directions
  'carte|map|itinéraire|direction|navigation|خريطة|اتجاهات': {
    fr: '🗺️ Pour obtenir l\'itinéraire:\n\n1. Allez sur la page d\'un lieu\n2. Cliquez sur "Obtenir l\'itinéraire"\n3. Google Maps s\'ouvre avec la direction\n\nAssurez-vous que votre localisation est activée pour la meilleure expérience!',
    en: '🗺️ To get directions:\n\n1. Go to a place page\n2. Click on "Get directions"\n3. Google Maps opens with directions\n\nMake sure your location is enabled for the best experience!',
    ar: '🗺️ للحصول على الاتجاهات:\n\n1. انتقل إلى صفحة مكان ما\n2. انقر على "احصل على الاتجاهات"\n3. تفتح خرائط جوجل مع الاتجاهات\n\nتأكد من تفعيل موقعك للحصول على أفضل تجربة!',
  },
};

const detectLanguage = (text: string): 'fr' | 'en' | 'ar' => {
  if (/[àâçéèêëîïôûùüÿñæœ]/.test(text)) return 'fr';
  if (/[أبتثجحخدذرزسشصضطظعغفقكلمنهوي]/.test(text)) return 'ar';
  return 'en';
};

const getBotResponse = (message: string): string => {
  const lowerMsg = message.toLowerCase();
  const language = detectLanguage(message);
  
  // Check each category for matching keywords
  for (const [keywords, responses] of Object.entries(botResponses)) {
    const keywordList = keywords.split('|');
    if (keywordList.some(keyword => lowerMsg.includes(keyword))) {
      return responses[language];
    }
  }
  
  // Default responses by language
  const defaultResponses = {
    fr: "Je suis là pour vous aider! 😊 Pourriez-vous préciser votre question? Vous pouvez me parler de:\n\n• Réservations 📅\n• Paiements 💳\n• Horaires 🕐\n• Villes 🏙️\n• Favoris ❤️\n• Itinéraire 🗺️\n\nDites-moi ce qui vous intéresse!",
    en: "I'm here to help! 😊 Could you please clarify your question? You can ask me about:\n\n• Bookings 📅\n• Payments 💳\n• Hours 🕐\n• Cities 🏙️\n• Favorites ❤️\n• Directions 🗺️\n\nTell me what you're interested in!",
    ar: "أنا هنا للمساعدة! 😊 هل يمكنك توضيح سؤالك؟ يمكنك سؤالي عن:\n\n• الحجوزات 📅\n• المدفوعات 💳\n• ساعات العمل 🕐\n• المدن 🏙️\n• المفضلة ❤️\n• الاتجاهات 🗺️\n\nأخبرني ما الذي يهمك!",
  };
  
  return defaultResponses[language];
};

export const useSupportStore = create<SupportState>((set, get) => ({
  tickets: [],
  currentTicket: null,
  isLoading: false,
  isConnectedToHuman: false,

  createTicket: async (userId: number, subject: string, message: string) => {
    const newTicket: Ticket = {
      id: Date.now().toString(),
      userId,
      subject,
      messages: [
        {
          id: Date.now().toString(),
          text: message,
          sender: 'user',
          timestamp: new Date(),
          status: 'sent',
        },
        {
          id: (Date.now() + 1).toString(),
          text: getBotResponse(message),
          sender: 'bot',
          timestamp: new Date(),
          status: 'sent',
        },
      ],
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const existingTickets = await AsyncStorage.getItem('support_tickets');
    const tickets = existingTickets ? JSON.parse(existingTickets) : [];
    tickets.push(newTicket);
    await AsyncStorage.setItem('support_tickets', JSON.stringify(tickets));
    
    set({ tickets: [...get().tickets, newTicket], currentTicket: newTicket });
  },

  sendMessage: async (ticketId: string, text: string) => {
    const { tickets, isConnectedToHuman } = get();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
    };

    tickets[ticketIndex].messages.push(newMessage);
    tickets[ticketIndex].updatedAt = new Date();

    if (!isConnectedToHuman) {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(text),
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent',
      };
      tickets[ticketIndex].messages.push(botMessage);
    }

    await AsyncStorage.setItem('support_tickets', JSON.stringify(tickets));
    set({ tickets: [...tickets], currentTicket: tickets[ticketIndex] });
  },

  getTickets: async (userId: number) => {
    const savedTickets = await AsyncStorage.getItem('support_tickets');
    const allTickets = savedTickets ? JSON.parse(savedTickets) : [];
    const userTickets = allTickets.filter((t: Ticket) => t.userId === userId);
    set({ tickets: userTickets });
    return userTickets;
  },

  getTicket: async (ticketId: string) => {
    const savedTickets = await AsyncStorage.getItem('support_tickets');
    const allTickets = savedTickets ? JSON.parse(savedTickets) : [];
    const ticket = allTickets.find((t: Ticket) => t.id === ticketId);
    set({ currentTicket: ticket || null });
    return ticket || null;
  },

  requestHumanSupport: async (ticketId: string) => {
    const { tickets } = get();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return;

    const humanMessage: Message = {
      id: Date.now().toString(),
      text: "📞 Un agent va vous assister dans quelques instants. Merci de votre patience.\n\n👤 Un agent humain vous répondra bientôt! En attendant, je reste disponible pour répondre à vos questions générales.",
      sender: 'bot',
      timestamp: new Date(),
      status: 'sent',
    };
    
    tickets[ticketIndex].messages.push(humanMessage);
    tickets[ticketIndex].status = 'in_progress';
    await AsyncStorage.setItem('support_tickets', JSON.stringify(tickets));
    set({ tickets: [...tickets], currentTicket: tickets[ticketIndex], isConnectedToHuman: true });
  },

  closeTicket: async (ticketId: string) => {
    const { tickets } = get();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return;

    tickets[ticketIndex].status = 'closed';
    await AsyncStorage.setItem('support_tickets', JSON.stringify(tickets));
    set({ tickets: [...tickets], currentTicket: tickets[ticketIndex], isConnectedToHuman: false });
  },

  loadTickets: async (userId: number) => {
    set({ isLoading: true });
    await get().getTickets(userId);
    set({ isLoading: false });
  },
}));