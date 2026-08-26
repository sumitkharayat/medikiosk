import React, { useState, useEffect, useRef } from 'react';
import { useKiosk } from '../../context/KioskContext';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../../data/languages';
import { QUESTION_FLOW } from '../../data/aiQuestionsTree';
import { ChatMessage } from '../../types';
import { api } from '../../api/client';
import { 
  Stethoscope, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  ArrowLeft
} from 'lucide-react';

export const Step4AIConsultation: React.FC = () => {
  const { 
    activeKioskPatient, 
    addChatMessageToKiosk, 
    currentLanguage, 
    setKioskStep 
  } = useKiosk();
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSynthEnabled, setSpeechSynthEnabled] = useState(true);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const messages = activeKioskPatient.conversationHistory || [];
  const patientTurns = messages.filter(m => m.sender === 'patient').length;
  const currentQIndex = Math.min(patientTurns, QUESTION_FLOW.length - 1);
  const currentQuestion = QUESTION_FLOW[currentQIndex];

  // Initialize or update initial greeting when language changes
  useEffect(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].sender === 'ai')) {
      const firstQ = QUESTION_FLOW[0];
      const greeting = firstQ.textByLang[currentLanguage] || firstQ.textByLang.en;
      
      const welcomeMsg: ChatMessage = {
        id: `ai-msg-0`,
        sender: 'ai',
        text: greeting,
        language: currentLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'complaint'
      };
      
      if (messages.length === 0) {
        addChatMessageToKiosk(welcomeMsg);
      }
      speakText(greeting, currentLanguage);
    }
  }, [currentLanguage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  // Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);
      recognition.lang = langConfig?.voiceLangCode || 'hi-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handlePatientSendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [currentLanguage]);

  const speakText = (text: string, langCode: string) => {
    if (!speechSynthEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
      const targetLangCode = langObj?.voiceLangCode || 'hi-IN';
      utterance.lang = targetLangCode;
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.lang === targetLangCode || v.lang.startsWith(targetLangCode.split('-')[0]));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);
          recognitionRef.current.lang = langConfig?.voiceLangCode || 'hi-IN';
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          setIsListening(false);
        }
      } else {
        // Fallback simulation
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          const sampleAnswers: Record<string, string[]> = {
            hi: ["मुझे सीने में भारीपन और पसीना आ रहा है।", "यह पिछले 2 दिनों से सीढ़ी चढ़ने पर होता है।"],
            bn: ["আমার বুকে চাপ এবং খুব কষ্ট হচ্ছে।", "গত ২ দিন ধরে হাঁটাহাঁটি করলে ব্যথা বাড়ে।"],
            te: ["నాకు ఛాతీలో నొప్పి మరియు చెమటలు పడుతున్నాయి.", "గత 2 రోజులుగా మెట్లు ఎక్కినప్పుడు ఎక్కువవుతుంది."],
            ta: ["எனக்கு மார்பில் இறுக்கமும் வியர்வையும் உள்ளது.", "கடந்த 2 நாட்களாக நடக்கும் போது அதிகமாகிறது."],
            mr: ["मला छातीत जड वाटत असून खूप घाम येत आहे.", "गेल्या २ दिवसांपासून त्रास होतो."],
            gu: ["મને છાતીમાં દુખાવો અને પરસેવો થાય છે.", "છેલ્લા ૨ દિવસથી તકલીફ છે."],
            kn: ["ನನಗೆ ಎದೆಯಲ್ಲಿ ನೋವು ಮತ್ತು ವಿಪರೀತ ಬೆವರುತ್ತಿದೆ."],
            ml: ["എനിക്ക് നെഞ്ചിൽ ഭാരവും വിയർപ്പും അനുഭവപ്പെടുന്നു."],
            pa: ["ਮੈਨੂੰ ਛਾਤੀ ਵਿੱਚ ਦਰਦ ਅਤੇ ਪਸੀਨਾ ਆ ਰਿਹਾ ਹੈ।"],
            en: ["I have heavy pressure in my chest with diaphoresis.", "It started 2 days ago."]
          };
          const answers = sampleAnswers[currentLanguage] || sampleAnswers.en;
          const sampleAnswer = answers[Math.min(currentQIndex, answers.length - 1)];
          handlePatientSendMessage(sampleAnswer);
        }, 1500);
      }
    }
  };

  const handlePatientSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const patientMsg: ChatMessage = {
      id: `pat-msg-${Date.now()}`,
      sender: 'patient',
      text: textToSend.trim(),
      language: currentLanguage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addChatMessageToKiosk(patientMsg);
    setInputText('');
    setIsAiThinking(true);

    try {
      const res = await api.sendChatMessage(activeKioskPatient.id, textToSend.trim(), currentLanguage);
      if (res.success && res.aiMessage) {
        addChatMessageToKiosk(res.aiMessage);
        speakText(res.aiMessage.text, currentLanguage);
      } else {
        throw new Error("Chat fallback");
      }
    } catch (e) {
      // Local fallback
      setTimeout(() => {
        const nextIdx = patientTurns + 1;
        if (nextIdx < QUESTION_FLOW.length) {
          const nextQ = QUESTION_FLOW[nextIdx];
          const qText = nextQ.textByLang[currentLanguage] || nextQ.textByLang.en;
          const aiMsg: ChatMessage = {
            id: `ai-msg-${Date.now()}`,
            sender: 'ai',
            text: qText,
            language: currentLanguage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            category: nextQ.category
          };
          addChatMessageToKiosk(aiMsg);
          speakText(qText, currentLanguage);
        } else {
          const completionMsg: ChatMessage = {
            id: `ai-msg-done`,
            sender: 'ai',
            text: t.step5Subtitle || "Thank you. Your clinical interview is complete.",
            language: currentLanguage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          addChatMessageToKiosk(completionMsg);
          speakText(completionMsg.text, currentLanguage);
        }
      }, 700);
    } finally {
      setIsAiThinking(false);
    }
  };

  const quickReplies = currentQuestion?.quickRepliesByLang?.[currentLanguage] || currentQuestion?.quickRepliesByLang?.en || [];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* Top Header with Audio Toggle */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t.step4Title}</h2>
            <p className="text-xs text-slate-500">{t.speakOrTap}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSpeechSynthEnabled(!speechSynthEnabled)}
          className={`p-2.5 rounded-xl border transition-all ${
            speechSynthEnabled
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}
          title="Toggle Voice"
        >
          {speechSynthEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 h-72 sm:h-80 overflow-y-auto space-y-4 shadow-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'patient' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-emerald-600/30">
                <Stethoscope className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === 'patient'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-slate-100 border border-slate-200 text-slate-900 rounded-bl-none'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-[10px] font-bold opacity-75">
                  {msg.sender === 'patient' ? t.you : t.aiDoctor}
                </span>
                {msg.sender === 'ai' && (
                  <button
                    type="button"
                    onClick={() => speakText(msg.text, msg.language || currentLanguage)}
                    className="text-slate-500 hover:text-emerald-700 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-base font-semibold">{msg.text}</p>
            </div>
          </div>
        ))}

        {isAiThinking && (
          <div className="flex items-center gap-2 text-slate-500 text-xs p-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{t.listeningNow}...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick 1-Tap Reply Pills */}
      {patientTurns < QUESTION_FLOW.length && quickReplies.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-600">{t.tapToAnswer}</span>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePatientSendMessage(reply)}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 transition-all text-left shadow-sm"
              >
                ✓ {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice & Input Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
        
        {/* Big Central Mic Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={toggleListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all shadow-lg ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse scale-110 shadow-rose-600/40'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:scale-105'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <span className="text-xs font-bold text-slate-700 block mt-2">
            {isListening ? `🎙️ ${t.listeningNow}` : `🎙️ ${t.tapToSpeak}`}
          </span>
        </div>

        {/* Text Input Row */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePatientSendMessage(inputText);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.typePlaceholder}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setKioskStep(3)}
          className="py-4 rounded-2xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <button
          type="button"
          onClick={() => setKioskStep(5)}
          className="py-4 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <span>{t.finishGetToken}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
