import React, { createContext, useContext, useState } from "react";

type Lang = "en" | "hi";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Navigation
    "nav.map": "Live Map",
    "nav.report": "Report Incident",
    "nav.journey": "My Journey",
    "nav.contacts": "Contacts",
    "nav.feed": "Community Feed",
    "nav.nearby": "Nearby Help",
    "nav.settings": "Settings",
    "nav.safe": "I'M SAFE ✓",

    // Top bar
    "topbar.live": "LIVE",
    "topbar.location_loading": "Detecting location...",

    // SOS
    "sos.button": "SOS",
    "sos.activating": "SOS activating... tap cancel to stop",
    "sos.cancel": "CANCEL",
    "sos.emergency_active": "● EMERGENCY ACTIVE",
    "sos.alert_sent": "🚨 SOS Alert Sent",
    "sos.live_location": "LIVE LOCATION",
    "sos.copy": "COPY",
    "sos.notifying": "NOTIFYING CONTACTS",
    "sos.no_contacts": "No contacts added. Go to Contacts to add emergency contacts.",
    "sos.whatsapp_all": "📲 Send WhatsApp to All Contacts",
    "sos.record": "🎙 RECORD AUDIO EVIDENCE",
    "sos.recording": "● REC",
    "sos.stop_save": "STOP & SAVE",
    "sos.audio_saved": "✓ Audio Evidence Saved",
    "sos.fake_call": "📞 FAKE CALL",
    "sos.im_safe": "✓ I'M SAFE — Cancel Emergency",
    "sos.whatsapp_sent": "✓ WhatsApp Sent",
    "sos.pending": "Pending",

    // I'm Safe button
    "safe.confirm": "Confirm you are safe?",
    "safe.yes": "YES — Notify Contacts",
    "safe.no": "No",
    "safe.toast": "Safety update sent to all contacts",

    // Map layers
    "layer.heatmap": "Heatmap",
    "layer.incidents": "Incidents",
    "layer.safe_route": "Safe Route",
    "layer.live_track": "Live Track",
    "layer.title": "LAYERS",

    // Risk panel
    "risk.title": "AREA RISK",
    "risk.low": "LOW",
    "risk.medium": "MEDIUM",
    "risk.high": "HIGH",
    "risk.critical": "CRITICAL",
    "risk.run_ai": "RUN AI ANALYSIS",
    "risk.loading": "Analyzing area...",
    "risk.legend": "RISK LEGEND",
    "risk.legend.safe": "Green = Safe",
    "risk.legend.medium": "Yellow = Medium",
    "risk.legend.danger": "Red = Dangerous",

    // Report Incident
    "report.title": "NEW FIELD REPORT",
    "report.type": "INCIDENT TYPE",
    "report.harassment": "Harassment",
    "report.stalking": "Stalking",
    "report.assault": "Assault",
    "report.theft": "Theft",
    "report.lighting": "Poor Lighting",
    "report.isolated": "Isolated Area",
    "report.suspicious": "Suspicious Activity",
    "report.other": "Other",
    "report.location": "LOCATION",
    "report.use_current": "Use Current Location",
    "report.severity": "SEVERITY",
    "report.severity.low": "Low",
    "report.severity.critical": "Critical",
    "report.description": "DESCRIPTION (optional)",
    "report.media": "ADD PHOTO/VIDEO (optional)",
    "report.anonymous": "Anonymous Report",
    "report.submit": "SUBMIT REPORT →",
    "report.success": "Report submitted successfully",

    // Journey
    "journey.title": "MY JOURNEY",
    "journey.destination": "Destination",
    "journey.eta": "Expected Arrival Time",
    "journey.contacts": "Notify Contacts",
    "journey.start": "START JOURNEY",
    "journey.active": "Journey Active",
    "journey.share": "Share Link",
    "journey.arrived": "ARRIVED SAFELY ✓",
    "journey.watching": "contacts watching",

    // Contacts
    "contacts.title": "EMERGENCY CONTACTS",
    "contacts.add": "+ Add Contact",
    "contacts.name": "Name",
    "contacts.phone": "Phone Number",
    "contacts.relation": "Relation",
    "contacts.family": "Family",
    "contacts.friend": "Friend",
    "contacts.colleague": "Colleague",
    "contacts.save": "Save Contact",
    "contacts.test": "Send Test Alert",
    "contacts.max": "Maximum 5 contacts allowed",

    // Community Feed
    "feed.title": "COMMUNITY FEED",
    "feed.filter.all": "All",
    "feed.filter.nearby": "Near Me",
    "feed.filter.high": "High Severity",
    "feed.filter.today": "Last 24h",
    "feed.verified": "Verified",
    "feed.flag": "Flag",
    "feed.view_map": "View on Map",
    "feed.ago": "ago",
    "feed.km_away": "km away",
    "feed.no_reports": "No reports in this area",

    // Nearby Help
    "nearby.title": "NEARBY HELP",
    "nearby.medical": "Medical",
    "nearby.restrooms": "Restrooms",
    "nearby.govt": "Gov. Centers",
    "nearby.police": "Police",
    "nearby.loading": "Finding nearby places...",
    "nearby.no_results": "No results found nearby",
    "nearby.directions": "Directions",
    "nearby.call": "CALL",
    "nearby.km_away": "km away",
    "nearby.no_number": "No number listed",
    "nearby.sanitary_note": "💊 Many government hospitals provide free sanitary products. Ask at reception.",
    "nearby.govt_note": "🏛 Government centers may offer free sanitary pad schemes.",
    "nearby.emergency_numbers": "EMERGENCY NUMBERS",
    "nearby.unnamed": "Unnamed Facility",

    // Emergency numbers
    "emergency.police": "Police",
    "emergency.ambulance": "Ambulance",
    "emergency.women": "Women Helpline",
    "emergency.fire": "Fire",
    "emergency.tap_call": "TAP TO CALL",

    // Settings
    "settings.title": "SETTINGS",
    "settings.fake_caller": "Fake Call — Caller Name",
    "settings.fake_caller_hint": "Name shown on fake incoming call screen",
    "settings.language": "Language",
    "settings.save": "Save Settings",
    "settings.saved": "Settings saved",
    "settings.notifications": "Push Notifications",
    "settings.location": "Location Accuracy",
    "settings.theme": "Theme",

    // Status bar
    "status.connected": "Online",
    "status.offline": "Offline",
    "status.battery": "Battery",
    "status.charging": "Charging",

    // Battery warning
    "battery.warning": "Battery at {percent}% — Charge soon for uninterrupted safety tracking",

    // Map incident types
    "incident.HARASSMENT": "Harassment",
    "incident.STALKING": "Stalking",
    "incident.ASSAULT": "Assault",
    "incident.THEFT": "Theft",
    "incident.POOR_LIGHTING": "Poor Lighting",
    "incident.ISOLATED_AREA": "Isolated Area",
    "incident.SUSPICIOUS_ACTIVITY": "Suspicious Activity",
    "incident.OTHER": "Other",
    "incident.severity": "Severity",
    "incident.reported": "Reported",
    "incident.verified_by": "Verified by",
    "incident.people": "people",
    "incident.report_time": "Report Time",
  },

  hi: {
    // Navigation
    "nav.map": "लाइव मैप",
    "nav.report": "घटना रिपोर्ट करें",
    "nav.journey": "मेरी यात्रा",
    "nav.contacts": "संपर्क",
    "nav.feed": "सामुदायिक फ़ीड",
    "nav.nearby": "नज़दीकी सहायता",
    "nav.settings": "सेटिंग्स",
    "nav.safe": "मैं सुरक्षित हूँ ✓",

    // Top bar
    "topbar.live": "लाइव",
    "topbar.location_loading": "स्थान खोजा जा रहा है...",

    // SOS
    "sos.button": "SOS",
    "sos.activating": "SOS सक्रिय हो रहा है... रद्द करने के लिए टैप करें",
    "sos.cancel": "रद्द करें",
    "sos.emergency_active": "● आपातकाल सक्रिय",
    "sos.alert_sent": "🚨 SOS अलर्ट भेजा गया",
    "sos.live_location": "लाइव स्थान",
    "sos.copy": "कॉपी",
    "sos.notifying": "संपर्कों को सूचित किया जा रहा है",
    "sos.no_contacts": "कोई संपर्क नहीं जोड़ा गया। संपर्क पृष्ठ पर जाएं।",
    "sos.whatsapp_all": "📲 सभी को WhatsApp भेजें",
    "sos.record": "🎙 ऑडियो साक्ष्य रिकॉर्ड करें",
    "sos.recording": "● रिकॉर्डिंग",
    "sos.stop_save": "रोकें और सहेजें",
    "sos.audio_saved": "✓ ऑडियो सहेजा गया",
    "sos.fake_call": "📞 नकली कॉल",
    "sos.im_safe": "✓ मैं सुरक्षित हूँ — आपातकाल रद्द करें",
    "sos.whatsapp_sent": "✓ WhatsApp भेजा गया",
    "sos.pending": "प्रतीक्षित",

    // I'm Safe button
    "safe.confirm": "क्या आप सुरक्षित हैं?",
    "safe.yes": "हाँ — संपर्कों को सूचित करें",
    "safe.no": "नहीं",
    "safe.toast": "सुरक्षा अपडेट सभी संपर्कों को भेजा गया",

    // Map layers
    "layer.heatmap": "हीटमैप",
    "layer.incidents": "घटनाएं",
    "layer.safe_route": "सुरक्षित मार्ग",
    "layer.live_track": "लाइव ट्रैक",
    "layer.title": "परतें",

    // Risk panel
    "risk.title": "क्षेत्र जोखिम",
    "risk.low": "कम",
    "risk.medium": "मध्यम",
    "risk.high": "अधिक",
    "risk.critical": "गंभीर",
    "risk.run_ai": "AI विश्लेषण चलाएं",
    "risk.loading": "क्षेत्र का विश्लेषण हो रहा है...",
    "risk.legend": "जोखिम संकेत",
    "risk.legend.safe": "हरा = सुरक्षित",
    "risk.legend.medium": "पीला = मध्यम",
    "risk.legend.danger": "लाल = खतरनाक",

    // Report Incident
    "report.title": "नई घटना रिपोर्ट",
    "report.type": "घटना का प्रकार",
    "report.harassment": "उत्पीड़न",
    "report.stalking": "पीछा करना",
    "report.assault": "हमला",
    "report.theft": "चोरी",
    "report.lighting": "खराब रोशनी",
    "report.isolated": "एकांत क्षेत्र",
    "report.suspicious": "संदिग्ध गतिविधि",
    "report.other": "अन्य",
    "report.location": "स्थान",
    "report.use_current": "वर्तमान स्थान उपयोग करें",
    "report.severity": "गंभीरता",
    "report.severity.low": "कम",
    "report.severity.critical": "गंभीर",
    "report.description": "विवरण (वैकल्पिक)",
    "report.media": "फ़ोटो/वीडियो जोड़ें (वैकल्पिक)",
    "report.anonymous": "गुमनाम रिपोर्ट",
    "report.submit": "रिपोर्ट जमा करें →",
    "report.success": "रिपोर्ट सफलतापूर्वक जमा हुई",

    // Journey
    "journey.title": "मेरी यात्रा",
    "journey.destination": "गंतव्य",
    "journey.eta": "अपेक्षित आगमन समय",
    "journey.contacts": "संपर्कों को सूचित करें",
    "journey.start": "यात्रा शुरू करें",
    "journey.active": "यात्रा सक्रिय है",
    "journey.share": "लिंक शेयर करें",
    "journey.arrived": "सुरक्षित पहुंच गई ✓",
    "journey.watching": "संपर्क देख रहे हैं",

    // Contacts
    "contacts.title": "आपातकालीन संपर्क",
    "contacts.add": "+ संपर्क जोड़ें",
    "contacts.name": "नाम",
    "contacts.phone": "फ़ोन नंबर",
    "contacts.relation": "संबंध",
    "contacts.family": "परिवार",
    "contacts.friend": "दोस्त",
    "contacts.colleague": "सहकर्मी",
    "contacts.save": "संपर्क सहेजें",
    "contacts.test": "परीक्षण अलर्ट भेजें",
    "contacts.max": "अधिकतम 5 संपर्क जोड़े जा सकते हैं",

    // Community Feed
    "feed.title": "सामुदायिक फ़ीड",
    "feed.filter.all": "सभी",
    "feed.filter.nearby": "पास में",
    "feed.filter.high": "गंभीर",
    "feed.filter.today": "पिछले 24 घंटे",
    "feed.verified": "सत्यापित",
    "feed.flag": "रिपोर्ट करें",
    "feed.view_map": "मैप पर देखें",
    "feed.ago": "पहले",
    "feed.km_away": "किमी दूर",
    "feed.no_reports": "इस क्षेत्र में कोई रिपोर्ट नहीं",

    // Nearby Help
    "nearby.title": "नज़दीकी सहायता",
    "nearby.medical": "चिकित्सा",
    "nearby.restrooms": "शौचालय",
    "nearby.govt": "सरकारी केंद्र",
    "nearby.police": "पुलिस",
    "nearby.loading": "नज़दीकी स्थान खोजे जा रहे हैं...",
    "nearby.no_results": "पास में कोई स्थान नहीं मिला",
    "nearby.directions": "दिशा",
    "nearby.call": "कॉल करें",
    "nearby.km_away": "किमी दूर",
    "nearby.no_number": "नंबर उपलब्ध नहीं",
    "nearby.sanitary_note": "💊 सरकारी अस्पतालों में मुफ़्त सैनिटरी पैड मिलते हैं। रिसेप्शन पर पूछें।",
    "nearby.govt_note": "🏛 सरकारी केंद्रों में मुफ़्त सैनिटरी पैड योजना उपलब्ध हो सकती है।",
    "nearby.emergency_numbers": "आपातकालीन नंबर",
    "nearby.unnamed": "अज्ञात स्थान",

    // Emergency numbers
    "emergency.police": "पुलिस",
    "emergency.ambulance": "एम्बुलेंस",
    "emergency.women": "महिला हेल्पलाइन",
    "emergency.fire": "अग्निशमन",
    "emergency.tap_call": "कॉल करें",

    // Settings
    "settings.title": "सेटिंग्स",
    "settings.fake_caller": "नकली कॉल — कॉलर का नाम",
    "settings.fake_caller_hint": "नकली इनकमिंग कॉल स्क्रीन पर दिखने वाला नाम",
    "settings.language": "भाषा",
    "settings.save": "सेटिंग्स सहेजें",
    "settings.saved": "सेटिंग्स सहेजी गईं",
    "settings.notifications": "पुश नोटिफिकेशन",
    "settings.location": "स्थान सटीकता",
    "settings.theme": "थीम",

    // Status bar
    "status.connected": "ऑनलाइन",
    "status.offline": "ऑफलाइन",
    "status.battery": "बैटरी",
    "status.charging": "चार्ज हो रही है",

    // Battery warning
    "battery.warning": "बैटरी {percent}% — सुरक्षित ट्रैकिंग के लिए चार्ज करें",

    // Map incident popups
    "incident.HARASSMENT": "उत्पीड़न",
    "incident.STALKING": "पीछा करना",
    "incident.ASSAULT": "हमला",
    "incident.THEFT": "चोरी",
    "incident.POOR_LIGHTING": "खराब रोशनी",
    "incident.ISOLATED_AREA": "एकांत क्षेत्र",
    "incident.SUSPICIOUS_ACTIVITY": "संदिग्ध गतिविधि",
    "incident.OTHER": "अन्य",
    "incident.severity": "गंभीरता",
    "incident.reported": "रिपोर्ट की गई",
    "incident.verified_by": "सत्यापित",
    "incident.people": "लोगों द्वारा",
    "incident.report_time": "रिपोर्ट समय",
  },
};

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}>({ lang: "en", setLang: () => {}, t: (k) => k });

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("guardian_lang") as Lang) || "en");

  const setLangPersist = (l: Lang) => {
    setLang(l);
    localStorage.setItem("guardian_lang", l);
  };

  const t = (key: string, vars?: Record<string, string>) => {
    let str = translations[lang][key] ?? translations["en"][key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v);
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangPersist, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
