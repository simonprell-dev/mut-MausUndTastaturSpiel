'use strict';
// Automatisch erzeugt von tools/make-class-lines.js – nicht von Hand ändern.
const VOICE_DUR = {
 "k|... kann er fliegen! Also ganz kurz.": 1.85,
 "k|Aaah. Viel besser! Rechts öffnet das Menü, links wählt aus. Merken!": 4.46,
 "k|Abgestürzt! Und alles ist weg! Ich hatte nicht gespeichert.": 3.06,
 "k|Achtung, jetzt krabbelt er los! Einmal noch!": 2.59,
 "k|Alle Buchstaben sind wieder da! Sogar das Ypsilon. Das wollte eigentlich in den Urlaub.": 4.45,
 "k|Alles noch da! Merke: Erst speichern, dann abstürzen.": 3.25,
 "k|Angekommen! Bestätige den Code mit der Enter-Taste. Die große Taste rechts.": 4.17,
 "k|Aua! Andere Richtung!": 1.53,
 "k|Aua! Wer stellt denn hier den Boden so hart ein?": 2.67,
 "k|Beweg deine Maus! Ja, die auf dem Tisch. Nicht die im Bildschirm!": 3.72,
 "k|Chaos-Schutz läuft! Du liest Fehlermeldungen besser als ich. Das ist allerdings auch nicht schwer.": 4.97,
 "k|Chip eingebaut! Der Roboter bekommt eine Gehaltserhöhung. Also: einen Keks.": 4.21,
 "k|Da ist es! Das Menü. Such dir mit der LINKEN Taste das Richtige aus.": 3.94,
 "k|Da ist sie wieder! Aber der Schatz liegt weiter rechts. Mach das Fenster groß: das Kästchen in der Mitte!": 4.92,
 "k|Danke! Ich lese alles. Also, sobald ich lesen gelernt habe.": 3.66,
 "k|Das geht auch! Aber probier mal den Trick: Strg festhalten und S drücken.": 4.49,
 "k|Das ist unser Reparaturroboter. Modell: ziemlich günstig.": 3.25,
 "k|Das kleine Ding hat unseren Mauszeiger geklaut!": 2.48,
 "k|Das macht es noch größer! Hilfe! Nimm den Strich.": 2.84,
 "k|Das stimmt noch nicht ganz. Mit der Löschtaste kannst du Fehler löschen.": 3.21,
 "k|Das war die linke Taste! Hier brauchen wir die rechte. Die unter dem Mittelfinger.": 3.82,
 "k|Das war die rechte Maustaste! Wir brauchen die linke. Die unter deinem Zeigefinger.": 4.16,
 "k|Das war schon so.": 0.93,
 "k|Deine Maus hat noch eine zweite Taste. Die rechte! Die liegt unter deinem Mittelfinger.": 4.48,
 "k|Der Computer fragt nach einem Namen. GEDICHT passt gut. Klick auf Speichern!": 4.16,
 "k|Der Ordner da ist eingeschlafen. Klick ihn mit der rechten Maustaste an!": 3.79,
 "k|Der Systemschlüssel! Schnapp ihn dir!": 2.04,
 "k|Der Virus! Du kannst alles, was man dafür braucht. Klick ihn an!": 3.66,
 "k|Die Buchstaben machen sich selbstständig!": 2.05,
 "k|Die linke Taste liegt unter deinem Zeigefinger. Unten links blinkt sie im Bild. Einmal kurz drücken!": 4.95,
 "k|Drin! Jetzt den Papierkorb leeren. Tippe TSCHAU und drücke Enter!": 3.56,
 "k|Drück das M! Das ist dieses Ding mit den drei Bergen!": 2.64,
 "k|Du bist jetzt offiziell Computer-Retter! Ich bin fast ein bisschen stolz.": 3.58,
 "k|Ein Bild gehört da nicht rein. Glaub mir, ich hab es selbst ausprobiert.": 3.91,
 "k|Ein Discokugel-Generator! Den suche ich seit Jahren.": 2.89,
 "k|Ein Klick bedeutet: Hallo, Ordner!": 2.02,
 "k|Ein Rechtsklick öffnet ein geheimes Menü. Darin steht, was man mit einem Ding machen kann.": 4.53,
 "k|Ein Schatz! Es sind ... Büroklammern. Meine Familie!": 2.95,
 "k|Eine Banane gehört da nicht rein. Glaub mir, ich hab es selbst ausprobiert.": 4.09,
 "k|Eine Socke gehört da nicht rein. Glaub mir, ich hab es selbst ausprobiert.": 3.85,
 "k|Er ist ganz benommen! Zieh ihn in den Papierkorb! Festhalten und ziehen!": 3.82,
 "k|Er kichert im Schlaf. Aber wach ist er nicht.": 2.16,
 "k|Fantastisch. Du kannst jetzt Türen öffnen, die gar keine Türen sind.": 3.28,
 "k|Fast geschafft! Was soll jetzt noch schiefgehen?": 2.45,
 "k|Fast! Der Käfer hat jetzt allerdings sehr gute Laune.": 3.16,
 "k|Fast! Such weiter. Die Taste versteckt sich nur.": 2.88,
 "k|Festhalten! Nicht loslassen! Du entführst gerade eine Datei.": 3.62,
 "k|Fünf von fünf! Jetzt ganze Wörter. Buchstabe für Buchstabe.": 3.64,
 "k|Für deine Urkunde brauche ich deinen Namen. Tippe ihn ein und drücke Enter!": 3.22,
 "k|Genau! Das Rädchen in der Mitte der Maus. So blätterst du durch lange Seiten.": 3.68,
 "k|Geschafft! Das System läuft wieder. Und ich habe fast gar nichts kaputt gemacht!": 3.67,
 "k|Gespeichert! Siehst du? Das Sternchen oben im Titel ist weg.": 3.57,
 "k|Guten Morgen, Ordner! Als Nächstes der alte Käse da. Der muss weg. Rechtsklick!": 4.5,
 "k|HA! Erwischt! Du bist offiziell schneller als ein Käfer mit Internetanschluss.": 4.18,
 "k|Halt! Hast du gelesen, was da steht?": 1.95,
 "k|Hol es wieder her: Klick unten in der Leiste auf SCHATZKARTE!": 3.08,
 "k|Ich habe aufgeräumt!": 1.14,
 "k|Ich habe eine Reparatur-Anleitung geschrieben. Sie ist nur ein klitzekleines bisschen lang.": 4.2,
 "k|Ich schreibe jetzt ein Gedicht. Pssst! Künstler bei der Arbeit.": 3.32,
 "k|Ich sehe den Desktop nicht mehr! Abbrechen! ABBRECHEN!": 3.2,
 "k|Ich zeige dir meine Schatzkarte! Moment, ich mache das Fenster auf ...": 3.47,
 "k|In einem dieser Ordner liegt der Systemschlüssel. Aber ich kriege sie nicht auf!": 3.75,
 "k|Jetzt der Reparaturbefehl! Den tippe ich. Ich bin schließlich Profi.": 3.42,
 "k|Jetzt heißt er Parfüm. Er stinkt trotzdem.": 2.45,
 "k|Jetzt mach das Fenster wieder kleiner. Nochmal dasselbe Kästchen!": 3.22,
 "k|Jetzt schläft er noch tiefer. Na toll.": 2.09,
 "k|Klein, groß, weg, wieder da. Du hast die Fenster im Griff!": 3.34,
 "k|Knopf gedrückt! Jetzt wieder ganz nach oben. Da fehlt noch ein Häkchen. Dreh das Rad von dir weg!": 4.96,
 "k|LIES! DEN! TEXT!": 1.33,
 "k|Lösch den Fehler mit der Löschtaste! Das ist die mit dem Pfeil, oben rechts.": 3.63,
 "k|Mach das Fenster klein! Oben rechts, der kleine Strich.": 2.92,
 "k|Mampf! Er sagt Danke. Glaube ich. Er hat den Mund voll.": 3.58,
 "k|Mit den Pfeiltasten lenkst du ihn.": 1.54,
 "k|Mmpf! Es ist auf mich draufgefallen! Ich klemme fest!": 2.97,
 "k|Moment mal. Wer hat eigentlich die ganzen Fehler geschickt?": 2.78,
 "k|Moment. Da kommt noch eine ...": 1.79,
 "k|Musik gehört da nicht rein. Glaub mir, ich hab es selbst ausprobiert.": 3.65,
 "k|Neue Zeilen, neues Sternchen. Jetzt der Profi-Trick: Halte Strg gedrückt und drücke S!": 4.86,
 "k|Nicht abbrechen! Sonst ist es ja wieder nicht gespeichert.": 2.78,
 "k|Nicht das Kreuz! Dann ist das Fenster ganz zu. Wir brauchen es noch.": 3.46,
 "k|Nicht nur klicken! Gedrückt halten und ziehen.": 2.32,
 "k|Nicht schummeln! Erst ganz nach unten blättern und den Knopf drücken.": 3.22,
 "k|Nicht verstecken! Nimm das Kästchen in der Mitte.": 2.56,
 "k|Nochmal? Gern! Ich drücke nur schnell diesen Kn...": 3.07,
 "k|Oh! Diese Taste löscht Fehler? Wo war die eigentlich mein ganzes Leben lang?": 3.99,
 "k|Oh! Hallo! Ich bin Klammi. Dein persönlicher Computerexperte!": 3.61,
 "k|Oh. Eine Fehlermeldung. Lies sie erst mal ganz durch!": 3.18,
 "k|Okay. Vielleicht brauchen wir ein klitzekleines bisschen Hilfe.": 3.31,
 "k|PIZZA? Hast du gerade Essen bestellt? Ohne mich?!": 2.78,
 "k|Puh! Alle weg. Lesen hilft. Wer hätte das gedacht?": 3.06,
 "k|Puh! Frei! Das Fenster ist nicht weg. Es wartet unten in der Leiste.": 4.1,
 "k|Puh! Schnell wieder zumachen!": 1.72,
 "k|Reingefallen! Diesmal war Abbrechen falsch. Immer erst lesen!": 3.65,
 "k|Riesig! Jetzt sieht man die ganze Karte. Da ist die Truhe! Klick sie an!": 3.93,
 "k|Schneller! Klick-klick! Wie ein Specht mit Termindruck.": 2.93,
 "k|Schon wieder abgestürzt! Aber diesmal haben wir gespeichert. Mach die Datei auf: Doppelklick!": 4.75,
 "k|Sechs Dateien sortiert! Ich würde sagen: Beförderung zum Chef des Aufräumens!": 4.09,
 "k|Sehr witzig. Wirklich.": 1.35,
 "k|Siehst du das Rädchen zwischen den Maustasten? Dreh es zu dir hin. Dann rutscht die Seite nach unten!": 4.62,
 "k|So. Diesmal speichern wir! Klick auf die Diskette oben links im Fenster.": 4.04,
 "k|Speichern heißt: Der Computer merkt sich deine Arbeit. Ohne Speichern vergisst er alles.": 4.71,
 "k|Springen geht mit der Leertaste! Das ist die lange Taste ganz unten.": 3.12,
 "k|Super! Jetzt schnapp dir den Käfer. Klick ihn an! Mit der linken Maustaste.": 4.51,
 "k|TSCHAU, Virus! Das System ist gerettet!": 2.46,
 "k|Und mit der Leertaste ...": 1.15,
 "k|Ups. Das X war ein Versehen. Die Tastatur hat gewackelt.": 3.55,
 "k|Vielleicht war Aufräumen das falsche Wort.": 1.85,
 "k|Vier neue Meldungen! Jedes Mal vier!": 2.12,
 "k|Von oben bis unten gelesen! Das hat noch nie jemand geschafft. Nicht mal ich.": 4.04,
 "k|Wackelpudding! Zum Glück ist der weich. Und lecker.": 2.64,
 "k|Warum tanzt da eine Kartoffel? Egal. Sie hat Talent.": 2.89,
 "k|Weg ist er! Rechtsklick ist toll! Ich tanze vor Freu...": 3.35,
 "k|Weiter, weiter! Ich habe sehr gründlich geschrieben.": 2.76,
 "k|Wiederholen wiederholt den FEHLER! Nicht die Rettung!": 2.65,
 "k|Wir fangen sie mit der Tastatur wieder ein. Such die richtige Taste!": 3.48,
 "k|Zack, gespeichert! Jetzt kann uns nichts mehr passier...": 3.03,
 "k|Zieh die Dateien in den richtigen Ordner! Maustaste drücken, festhalten, ziehen, loslassen.": 5.04,
 "k|Zwei schnelle Klicks bedeuten: MACH AUF!": 2.27,
 "k|Ähm.": 0.49,
 "k|Ähm. Das war schon so.": 1.34,
 "k|Ähm. Ich habe mich verknotet. Rechtsklick auf mich, bitte!": 2.97,
 "v|Aua! Das kitzelt!": 1.45,
 "v|Daneben! Ich bin viel zu schnell für dich!": 2.26,
 "v|He! Nicht so fest!": 1.55,
 "v|Lass mich los! Ich bin ein sehr wichtiger Virus!": 2.67,
 "v|Muahaha! Ich bin CHAOS.EXE! Ich habe dein System durcheinandergebracht!": 4.66,
 "v|Neeeein! Ich wollte doch nur spieleeen ...": 2.05
};
const CLASS_INTRO = {
 "boot": [
  {
   "w": "k",
   "t": "Aua! Wer stellt denn hier den Boden so hart ein?",
   "at": 11.68,
   "f": "k-9659971a880c.mp3",
   "d": 2.67
  },
  {
   "w": "k",
   "t": "Oh! Hallo! Ich bin Klammi. Dein persönlicher Computerexperte!",
   "at": 15.02,
   "f": "k-a35d12dad4ba.mp3",
   "d": 3.61
  },
  {
   "w": "k",
   "t": "Ähm.",
   "at": 20.4,
   "f": "k-d0f31be7e28c.mp3",
   "d": 0.49
  },
  {
   "w": "k",
   "t": "Das war schon so.",
   "at": 21.55,
   "f": "k-f7a0b0df7595.mp3",
   "d": 0.93
  },
  {
   "w": "k",
   "t": "Okay. Vielleicht brauchen wir ein klitzekleines bisschen Hilfe.",
   "at": 23.13,
   "f": "k-649b86c93949.mp3",
   "d": 3.31
  }
 ],
 "l1": [
  {
   "w": "k",
   "t": "Das kleine Ding hat unseren Mauszeiger geklaut!",
   "at": 1.7,
   "f": "k-36f3e1992442.mp3",
   "d": 2.48
  },
  {
   "w": "k",
   "t": "Beweg deine Maus! Ja, die auf dem Tisch. Nicht die im Bildschirm!",
   "at": 4.83,
   "f": "k-661042b8ef17.mp3",
   "d": 3.72
  }
 ],
 "l2": [
  {
   "w": "k",
   "t": "In einem dieser Ordner liegt der Systemschlüssel. Aber ich kriege sie nicht auf!",
   "at": 0,
   "f": "k-1f506483140a.mp3",
   "d": 3.75
  },
  {
   "w": "k",
   "t": "Ein Klick bedeutet: Hallo, Ordner!",
   "at": 4.42,
   "f": "k-ca6ec3f7ec9e.mp3",
   "d": 2.02
  }
 ],
 "lf": [
  {
   "w": "k",
   "t": "Ich zeige dir meine Schatzkarte! Moment, ich mache das Fenster auf ...",
   "at": 0,
   "f": "k-c7599c7684b7.mp3",
   "d": 3.47
  },
  {
   "w": "k",
   "t": "Mmpf! Es ist auf mich draufgefallen! Ich klemme fest!",
   "at": 4.65,
   "f": "k-4454a92b2561.mp3",
   "d": 2.97
  },
  {
   "w": "k",
   "t": "Mach das Fenster klein! Oben rechts, der kleine Strich.",
   "at": 8.28,
   "f": "k-01e8c5daa453.mp3",
   "d": 2.92
  }
 ],
 "l3": [
  {
   "w": "k",
   "t": "Ich habe aufgeräumt!",
   "at": 0,
   "f": "k-93f73c45699d.mp3",
   "d": 1.14
  },
  {
   "w": "k",
   "t": "Vielleicht war Aufräumen das falsche Wort.",
   "at": 2.6,
   "f": "k-55b6f179f5e5.mp3",
   "d": 1.85
  },
  {
   "w": "k",
   "t": "Zieh die Dateien in den richtigen Ordner! Maustaste drücken, festhalten, ziehen, loslassen.",
   "at": 5.12,
   "f": "k-bded4b2e6a51.mp3",
   "d": 5.04
  }
 ],
 "lw": [
  {
   "w": "k",
   "t": "Ich habe eine Reparatur-Anleitung geschrieben. Sie ist nur ein klitzekleines bisschen lang.",
   "at": 0,
   "f": "k-d0dbc6f14079.mp3",
   "d": 4.2
  },
  {
   "w": "k",
   "t": "Siehst du das Rädchen zwischen den Maustasten? Dreh es zu dir hin. Dann rutscht die Seite nach unten!",
   "at": 4.87,
   "f": "k-f8f49ada0380.mp3",
   "d": 4.62
  }
 ],
 "lr": [
  {
   "w": "k",
   "t": "Deine Maus hat noch eine zweite Taste. Die rechte! Die liegt unter deinem Mittelfinger.",
   "at": 0,
   "f": "k-16058a695b43.mp3",
   "d": 4.48
  },
  {
   "w": "k",
   "t": "Ein Rechtsklick öffnet ein geheimes Menü. Darin steht, was man mit einem Ding machen kann.",
   "at": 5.13,
   "f": "k-e595083e7c4c.mp3",
   "d": 4.53
  },
  {
   "w": "k",
   "t": "Der Ordner da ist eingeschlafen. Klick ihn mit der rechten Maustaste an!",
   "at": 10.32,
   "f": "k-cc890446f8d3.mp3",
   "d": 3.79
  }
 ],
 "l4": [
  {
   "w": "k",
   "t": "Die Buchstaben machen sich selbstständig!",
   "at": 0,
   "f": "k-a29479df8ee7.mp3",
   "d": 2.05
  },
  {
   "w": "k",
   "t": "Wir fangen sie mit der Tastatur wieder ein. Such die richtige Taste!",
   "at": 2.72,
   "f": "k-2e883071dce0.mp3",
   "d": 3.48
  }
 ],
 "ls": [
  {
   "w": "k",
   "t": "Ich schreibe jetzt ein Gedicht. Pssst! Künstler bei der Arbeit.",
   "at": 0,
   "f": "k-23d7fa1e52e5.mp3",
   "d": 3.32
  },
  {
   "w": "k",
   "t": "Abgestürzt! Und alles ist weg! Ich hatte nicht gespeichert.",
   "at": 6.98,
   "f": "k-e63887af4f10.mp3",
   "d": 3.06
  },
  {
   "w": "k",
   "t": "Speichern heißt: Der Computer merkt sich deine Arbeit. Ohne Speichern vergisst er alles.",
   "at": 10.7,
   "f": "k-614fb86573a6.mp3",
   "d": 4.71
  }
 ],
 "l5": [
  {
   "w": "k",
   "t": "Das ist unser Reparaturroboter. Modell: ziemlich günstig.",
   "at": 0,
   "f": "k-8b60caf2c4a6.mp3",
   "d": 3.25
  },
  {
   "w": "k",
   "t": "Mit den Pfeiltasten lenkst du ihn.",
   "at": 3.92,
   "f": "k-ec6008e6a5e7.mp3",
   "d": 1.54
  },
  {
   "w": "k",
   "t": "Und mit der Leertaste ...",
   "at": 6.12,
   "f": "k-7a361355432e.mp3",
   "d": 1.15
  },
  {
   "w": "k",
   "t": "... kann er fliegen! Also ganz kurz.",
   "at": 8.85,
   "f": "k-a7e224df67b6.mp3",
   "d": 1.85
  }
 ],
 "l6": [
  {
   "w": "k",
   "t": "Fast geschafft! Was soll jetzt noch schiefgehen?",
   "at": 0,
   "f": "k-6992c2126e05.mp3",
   "d": 2.45
  }
 ],
 "l7": [
  {
   "w": "k",
   "t": "Moment mal. Wer hat eigentlich die ganzen Fehler geschickt?",
   "at": 0,
   "f": "k-d489373b4e41.mp3",
   "d": 2.78
  },
  {
   "w": "v",
   "t": "Muahaha! Ich bin CHAOS.EXE! Ich habe dein System durcheinandergebracht!",
   "at": 4.03,
   "f": "v-b71a32187946.mp3",
   "d": 4.66
  },
  {
   "w": "k",
   "t": "Der Virus! Du kannst alles, was man dafür braucht. Klick ihn an!",
   "at": 9.35,
   "f": "k-6836c258b8f0.mp3",
   "d": 3.66
  }
 ],
 "end": [
  {
   "w": "k",
   "t": "Geschafft! Das System läuft wieder. Und ich habe fast gar nichts kaputt gemacht!",
   "at": 0,
   "f": "k-36521272d37d.mp3",
   "d": 3.67
  }
 ]
};
