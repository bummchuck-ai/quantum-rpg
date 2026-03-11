// ============================================================
// QUANTUM RPG — Internationalization (DE / EN)
// ============================================================
// Lightweight i18n: ~200 UI strings, stored in localStorage.
// Game data (JSON) stays German — the AI GM translates on-the-fly.
// ============================================================

const SETTINGS_KEY = 'quantum-rpg-settings';

export type Language = 'de' | 'en';

let currentLang: Language = 'de';
let loaded = false;

function ensureLoaded() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.language === 'en') currentLang = 'en';
    }
  } catch { /* use default */ }
}

export function getLanguage(): Language {
  ensureLoaded();
  return currentLang;
}

export function setLanguage(lang: Language) {
  currentLang = lang;
  loaded = true;
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...existing, language: lang }));
  } catch { /* storage full */ }
}

// ============================================================
// TRANSLATION DICTIONARY
// ============================================================

const dict: Record<string, { de: string; en: string }> = {
  // ---- START SCREEN ----
  newAdventure: { de: 'NEUES ABENTEUER', en: 'NEW ADVENTURE' },
  continueGame: { de: 'FORTSETZEN', en: 'CONTINUE' },
  archive: { de: 'Archiv', en: 'Archive' },
  system: { de: 'System', en: 'System' },
  defaultPlayerName: { de: 'Charakter', en: 'Character' },

  // ---- SYSTEM PANEL ----
  settings: { de: 'Einst.', en: 'Settings' },
  help: { de: 'Hilfe', en: 'Help' },
  credits: { de: 'Credits', en: 'Credits' },
  debug: { de: 'Debug', en: 'Debug' },
  masterVolume: { de: 'Master-Lautstärke', en: 'Master Volume' },
  soundEffects: { de: 'Sound-Effekte', en: 'Sound Effects' },
  sfxDesc: { de: 'UI-Klicks, Würfel, Kampf', en: 'UI clicks, dice, combat' },
  ambientMusic: { de: 'Ambient-Musik', en: 'Ambient Music' },
  ambientDesc: { de: 'Hintergrund-Atmosphäre', en: 'Background atmosphere' },
  narratorVoice: { de: 'Erzähler-Stimme', en: 'Narrator Voice' },
  narratorDesc: { de: 'GM-Text vorlesen lassen', en: 'Read GM text aloud' },
  speechInput: { de: 'Spracheingabe', en: 'Speech Input' },
  speechInputDesc: { de: 'Per Mikrofon sprechen', en: 'Speak via microphone' },
  notSupported: { de: 'Browser nicht unterstützt', en: 'Browser not supported' },
  language: { de: 'Sprache', en: 'Language' },
  close: { de: 'Schließen', en: 'Close' },

  // ---- SYSTEM PANEL: HELP ----
  gameTips: { de: 'Spieltipps', en: 'Game Tips' },
  tipAutoSave: { de: 'Auto-Save ist alle 60 Sekunden aktiv. Manuell speichern über das Disketten-Symbol im HUD.', en: 'Auto-save runs every 60 seconds. Save manually via the floppy disk icon in the HUD.' },
  tipMissions: { de: 'Aktive Missionen siehst du über den Missions-Button in der Toolbar.', en: 'View active missions via the missions button in the toolbar.' },
  tipDestiny: { de: 'Schicksalspunkte (Licht/Dunkel) kannst du über die Anzeige in der Toolbar wenden.', en: 'Flip destiny points (Light/Dark) via the display in the toolbar.' },
  tipDice: { de: 'Freie Würfe startest du über das Würfel-Symbol. Der GM fordert Proben automatisch an.', en: 'Start free rolls via the dice icon. The GM requests checks automatically.' },
  tipAmbient: { de: 'Ambient-Musik wechselt je nach Stimmung der Szene. Toggle über das Musik-Symbol.', en: 'Ambient music changes with scene mood. Toggle via the music icon.' },
  tipForce: { de: 'Machtkräfte erscheinen in der Toolbar nur für machtbegabte Karrieren.', en: 'Force powers appear in the toolbar only for Force-sensitive careers.' },

  // ---- SYSTEM PANEL: SPECIES GUIDE ----
  speciesGuide: { de: 'Spezies-Guide', en: 'Species Guide' },
  speciesHuman: { de: 'Vielseitig, 1 freier Rang in 2 nicht-Karriere-Fertigkeiten.', en: 'Versatile, 1 free rank in 2 non-career skills.' },
  speciesTwilek: { de: 'Charmant und geschickt. Natürliche Überzeugungskraft.', en: 'Charming and agile. Natural persuasion.' },
  speciesWookiee: { de: 'Riesig, stark, loyal. Regeneriert durch Wutanfälle.', en: 'Huge, strong, loyal. Regenerates through rage.' },
  speciesRodian: { de: 'Geborene Jäger mit scharfen Sinnen.', en: 'Born hunters with sharp senses.' },
  speciesTogruta: { de: 'Echolot-Sinne, Rudel-Instinkt, Jedi-Tradition.', en: 'Echolocation, pack instincts, Jedi tradition.' },
  speciesBothan: { de: 'Spione und Informationshändler der Galaxis.', en: 'Spies and information brokers of the galaxy.' },
  speciesDroid: { de: 'Programmiert, unermüdlich, modular erweiterbar.', en: 'Programmed, tireless, modularly upgradable.' },

  // ---- SYSTEM PANEL: SKILLS ----
  skillsOverview: { de: 'Fertigkeiten-Übersicht', en: 'Skills Overview' },
  general: { de: 'Allgemein', en: 'General' },
  combat: { de: 'Kampf', en: 'Combat' },
  knowledge: { de: 'Wissen', en: 'Knowledge' },

  // ---- SYSTEM PANEL: CREDITS ----
  conceptDev: { de: 'Konzept & Entwicklung', en: 'Concept & Development' },
  aiGM: { de: 'KI Game Master', en: 'AI Game Master' },
  ruleSystem: { de: 'Regelwerk', en: 'Rule System' },
  copyrightSW: { de: 'Star Wars ist ein Warenzeichen von Lucasfilm Ltd.', en: 'Star Wars is a trademark of Lucasfilm Ltd.' },
  copyrightFFG: { de: 'Genesys/FFG ist ein Warenzeichen von Fantasy Flight Games.', en: 'Genesys/FFG is a trademark of Fantasy Flight Games.' },
  copyrightFan: { de: 'Dieses Projekt ist ein Fan-Werk und steht in keiner Verbindung zu den Rechteinhabern.', en: 'This project is a fan work and is not affiliated with the rights holders.' },

  // ---- SYSTEM PANEL: DEBUG ----
  noEntries: { de: 'Keine Einträge', en: 'No entries' },
  totalSize: { de: 'Gesamt', en: 'Total' },
  deleteAllSaves: { de: 'Alle Spielstände löschen', en: 'Delete All Saves' },
  confirmDeleteSaves: { de: 'Ja, Spielstände löschen', en: 'Yes, Delete Saves' },
  deleteAllData: { de: 'Alle App-Daten löschen', en: 'Delete All App Data' },
  confirmDeleteAll: { de: 'Ja, ALLES löschen', en: 'Yes, DELETE ALL' },
  cancel: { de: 'Abbrechen', en: 'Cancel' },
  savesDeleted: { de: 'Alle Spielstände gelöscht.', en: 'All saves deleted.' },
  dataDeleted: { de: 'Einträge gelöscht. Seite wird neu geladen...', en: 'Entries deleted. Reloading page...' },

  // ---- CHAT INTERFACE ----
  gmThinking: { de: 'GM denkt...', en: 'GM thinking...' },
  narratorActive: { de: 'Erzähler aktiv — Tippen zum Stoppen', en: 'Narrator active — Tap to stop' },
  inputPlaceholder: { de: 'Eingabe...', en: 'Type here...' },
  listening: { de: 'Höre zu...', en: 'Listening...' },
  holdToSpeak: { de: 'Gedrückt halten zum Sprechen', en: 'Hold to speak' },
  rollDice: { de: 'Würfeln', en: 'Roll Dice' },
  noGear: { de: 'Keine Ausrüstung...', en: 'No equipment...' },
  gmTimeout: { de: 'GM antwortet nicht (Timeout). Bitte erneut versuchen.', en: 'GM not responding (timeout). Please try again.' },
  gmUnavailable: { de: 'Der Game Master ist momentan nicht erreichbar. Bitte versuche es erneut.', en: 'The Game Master is currently unavailable. Please try again.' },
  retryOption: { de: 'Erneut versuchen', en: 'Try again' },

  // ---- TOASTS ----
  darkSide: { de: 'Dunkle Seite', en: 'Dark Side' },
  lightSide: { de: 'Helle Seite', en: 'Light Side' },
  destinyPoint: { de: 'Schicksalspunkt', en: 'Destiny Point' },
  healed: { de: 'Geheilt', en: 'Healed' },
  combatWord: { de: 'Kampf', en: 'Combat' },

  // ---- CHARACTERISTICS ----
  brawn: { de: 'Stärke', en: 'Brawn' },
  agility: { de: 'Geschick', en: 'Agility' },
  intellect: { de: 'Intellekt', en: 'Intellect' },
  cunning: { de: 'List', en: 'Cunning' },
  willpower: { de: 'Willenskr.', en: 'Willpower' },
  presence: { de: 'Präsenz', en: 'Presence' },

  // ---- INTRO MODAL ----
  introTitle1: { de: 'DAS_QUANTUM_UNIVERSUM', en: 'THE_QUANTUM_UNIVERSE' },
  introTitle2: { de: 'DEIN_GAME_MASTER', en: 'YOUR_GAME_MASTER' },
  introTitle3: { de: 'ERSCHAFFE_DICH', en: 'CREATE_YOURSELF' },
  introTitle4: { de: 'BEREIT?', en: 'READY?' },
  introStart: { de: 'SYSTEM_START_→', en: 'SYSTEM_START_→' },
  introNext: { de: 'NÄCHSTER_SCHRITT_→', en: 'NEXT_STEP_→' },

  // ---- CHARACTER CREATION ----
  speciesHeader: { de: 'DATA_BASE: SPEZIES', en: 'DATA_BASE: SPECIES' },
  subspecies: { de: 'Subspezies', en: 'Subspecies' },
  selectSubspecies: { de: 'Subspezies_Wählen', en: 'Select_Subspecies' },
  chosen: { de: 'Gewählt', en: 'Chosen' },
  mustSelectSubspecies: { de: 'Subspezies muss gewählt werden', en: 'Subspecies must be selected' },
  selectSubspeciesBtn: { de: 'Subspezies_wählen...', en: 'Select_subspecies...' },
  authorizeIdentity: { de: 'Authorize_Identity_→', en: 'Authorize_Identity_→' },

  // ---- HOLOCRON GUIDES ----
  holocronSpecies: { de: 'SPEZIES_WAHL', en: 'SPECIES_CHOICE' },
  holocronSpeciesDesc: { de: 'Deine Spezies bestimmt deine biologischen Grundlagen — Attribute, Wundenschwelle, Stress und Spezialfähigkeiten.', en: 'Your species determines your biological foundations — attributes, wound threshold, strain, and special abilities.' },
  holocronSpeciesAdvice: { de: 'Manche Spezies haben Subspezies mit unterschiedlichen Boni. Wähle weise — diese Entscheidung ist permanent!', en: 'Some species have subspecies with different bonuses. Choose wisely — this decision is permanent!' },
  holocronArmory: { de: 'AUSRÜSTUNG', en: 'EQUIPMENT' },
  holocronArmoryDesc: { de: "Hier kaufst du Waffen, Rüstungen und Ausrüstung. 'Encumbrance' ist das Gewicht – trage nicht zu viel! 'Hard Points' sind Plätze für Upgrades. Vergiss nicht die Basics unter 'Gear': Stimpacks, Comlink, Werkzeug.", en: "Buy weapons, armor and equipment here. 'Encumbrance' is weight – don't carry too much! 'Hard Points' are slots for upgrades. Don't forget basics under 'Gear': Stimpacks, Comlink, Tools." },
  holocronArmoryAdvice: { de: 'Spare nicht an der Rüstung! Ein guter Soak-Wert rettet dir den Hintern. Kaufe mindestens 2-3 Stimpacks und einen Comlink – ohne stirbst du schnell. Der Rest ist Geschmackssache.', en: "Don't skimp on armor! A good Soak value saves your life. Buy at least 2-3 Stimpacks and a Comlink – you'll die fast without them. The rest is personal preference." },
  holocronDestiny: { de: 'SCHICKSAL_SCAN', en: 'DESTINY_SCAN' },
  holocronDestinyDesc: { de: 'Dein Hintergrund bestimmt, was dich antreibt — sei es eine Schuld, eine Pflicht oder ein moralisches Dilemma.', en: 'Your background determines what drives you — be it a debt, a duty, or a moral dilemma.' },
  holocronDestinyAdvice: { de: "Du kannst dein Schicksal erhöhen (Load) um XP-Bonus zu erhalten, oder es verringern (Reduce). Höheres Schicksal = stärkerer narrativer Einfluss!", en: "You can increase your destiny (Load) for XP bonus, or decrease it (Reduce). Higher destiny = stronger narrative impact!" },
  holocronSummary: { de: 'FINALE_ÜBERSICHT', en: 'FINAL_OVERVIEW' },
  holocronSummaryDesc: { de: 'Glückwunsch! Dein Charakter ist bereit für die Galaxis.', en: 'Congratulations! Your character is ready for the galaxy.' },
  holocronSummaryAdvice: { de: 'Überprüfe noch einmal deine Wounds und Strain-Schwellen. Ein guter Soak-Wert und etwas Heilung im Inventar können über Leben und Tod entscheiden!', en: 'Double-check your Wound and Strain thresholds. A good Soak value and some healing in your inventory can mean the difference between life and death!' },

  // ---- TALENT SELECTOR ----
  noTalentTree: { de: 'Kein Talentbaum gefunden', en: 'No talent tree found' },
  noTalentTreeDesc: { de: 'Für die gewählte Spezialisierung wurde kein passender Talentbaum gefunden.', en: 'No matching talent tree was found for the selected specialization.' },
  selectTalentTree: { de: 'Talentbaum manuell wählen...', en: 'Select talent tree manually...' },
  skipStep: { de: 'Überspringen_→', en: 'Skip_→' },
  confirmTraining: { de: 'Confirm_Training_Data_→', en: 'Confirm_Training_Data_→' },

  // ---- SKILL SELECTOR ----
  investXP: { de: 'Investiere XP in Fertigkeiten. Karriere-Skills kosten weniger!', en: 'Invest XP in skills. Career skills cost less!' },
  all: { de: 'Alle', en: 'All' },
  career: { de: 'Karriere', en: 'Career' },
  generalShort: { de: 'Allgem.', en: 'General' },

  // ---- ARCHIVE PANEL ----
  unknown: { de: 'Unbekannt', en: 'Unknown' },
  invalidData: { de: 'Ungültige Daten.', en: 'Invalid data.' },
  loadFailed: { de: 'Spielstand konnte nicht geladen werden.', en: 'Save could not be loaded.' },
  noAutosave: { de: 'Kein Autosave gefunden.', en: 'No autosave found.' },
  autosaveFailed: { de: 'Autosave konnte nicht geladen werden.', en: 'Autosave could not be loaded.' },
  saveDeleted: { de: 'Spielstand gelöscht.', en: 'Save deleted.' },
  saveImported: { de: 'Spielstand importiert.', en: 'Save imported.' },
  oldFormatImported: { de: 'Charakter importiert (altes Format).', en: 'Character imported (old format).' },
  invalidJSON: { de: 'Die Datei enthält kein gültiges JSON.', en: 'The file does not contain valid JSON.' },
  savesFound: { de: 'Spielstände gefunden', en: 'saves found' },
  noSaves: { de: 'Keine Spielstände vorhanden', en: 'No saves available' },

  // ---- SAVE/LOAD PANEL ----
  noDescription: { de: 'Keine Beschreibung verfügbar.', en: 'No description available.' },

  // ---- CHARACTER SUMMARY ----
  storyPrompt: { de: 'Du bist ein Star Wars Game Master. Schreibe eine kurze, epische Hintergrundgeschichte für diesen Charakter.', en: 'You are a Star Wars Game Master. Write a short, epic backstory for this character.' },
  archivesCorrupted: { de: 'Die Archive sind korrumpiert. Keine Geschichte verfügbar.', en: 'The archives are corrupted. No story available.' },
  holocronDisconnected: { de: 'Verbindung zum Holocron unterbrochen.', en: 'Connection to Holocron interrupted.' },

  // ---- TALENT SHOP (Play) ----
  noActivePlayer: { de: 'Kein aktiver Spieler ausgewaehlt...', en: 'No active player selected...' },
  selectTreePrompt: { de: 'Talentbaum wählen...', en: 'Select talent tree...' },
  selectTreeHelp: { de: 'Wähle einen Talentbaum oben aus', en: 'Select a talent tree above' },

  // ---- MISC ----
  available: { de: 'Available', en: 'Available' },
  owned: { de: 'OWNED', en: 'OWNED' },
  buyItem: { de: 'BUY ITEM', en: 'BUY ITEM' },
  insufficientFunds: { de: 'INSUFFICIENT FUNDS', en: 'INSUFFICIENT FUNDS' },
};

// ============================================================
// TRANSLATION FUNCTION
// ============================================================

export function t(key: string): string {
  ensureLoaded();
  const entry = dict[key];
  if (!entry) return key;
  return entry[currentLang] || entry.de || key;
}

// For React components that need to force re-render on language change
export function useLanguage(): Language {
  ensureLoaded();
  return currentLang;
}
