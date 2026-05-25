import React, { useState, useRef } from 'react';
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Globe, ChevronDown, Volume2, VolumeX } from "lucide-react";

const buttons = [
  "7", "8", "9", "/",
  "4", "5", "6", "*",
  "1", "2", "3", "-",
  "0", ".", "=", "+"
];

const languageNumerals: Record<string, string[]> = {
  English: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  Urdu: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
  Punjabi: ["੦", "੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯"],
  Sindhi: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
  Balochi: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
  Pathani: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
  Arabic: ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"],
  Turkey: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  Tamil: ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"],
  Siraki: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
  Hindko: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
  Brahua: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
  Shina: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
  Marathi: ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"],
  "Telugugujrati": ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"],
  Malayalam: ["൦", "൧", "൨", "൩", "൪", "൫", "൬", "൭", "൮", "൯"],
  Oedia: ["୦", "୧", "୨", "୩", "୪", "୫", "୬", "୭", "୮", "୯"],
  "Roman (Laateeni)": ["O", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
  "Ancient Egyptian (Hieroglyphic)": ["0", "𓏺", "𓏻", "𓏼", "𓏽", "𓏾", "𓏿", "𓐀", "𓐁", "𓐂"],
  Mayan: ["𝋀", "𝋁", "𝋂", "𝋃", "𝋄", "𝋅", "𝋆", "𝋇", "𝋈", "𝋉"],
  "Babylonian (Cuneiform)": ["0", "𒐕", "𒐖", "𒐗", "𒐘", "𒐙", "𒐚", "𒐛", "𒐜", "𒐝"],
  "Ancient Greek (Attic)": ["0", "Ι", "ΙΙ", "ΙΙΙ", "ΙΙΙΙ", "Π", "ΠΙ", "ΠΙΙ", "ΠΙΙΙ", "ΠΙΙΙΙ"],
  "Hebrew (Gematria)": ["0", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"],
  "Ge'ez (Ethiopic)": ["0", "፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱"],
  Armenian: ["0", "Ա", "Բ", "Գ", "Դ", "Ե", "Զ", "Է", "Ը", "Թ"],
  Gothic: ["0", "𐌰", "𐌱", "𐌲", "𐌳", "𐌴", "𐌵", "𐌶", "𐌷", "𐌸"],
  Sumerian: ["0", "𒐕", "𒐖", "𒐗", "𒐘", "𒐙", "𒐚", "𒐛", "𒐜", "𒐝"],
  "Chinese (Standard/Mandarin)": ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
  "Japanese (Kanji)": ["零", "壱", "弐", "参", "四", "伍", "六", "七", "八", "九"],
  "Korean (Hanja)": ["零", "壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖"],
  Thai: ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"],
  Khmer: ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"],
  Lao: ["໐", "໑", "໒", "໓", "໔", "໕", "໖", "໗", "໘", "໙"],
  Burmese: ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"],
  Tibetan: ["༠", "༡", "༢", "༣", "༤", "༥", "༦", "༧", "༨", "༩"],
  "Mongolian (Traditional)": ["᠐", "᠑", "᠒", "᠓", "᠔", "᠕", "᠖", "᠗", "᠘", "᠙"],
  Javanese: ["꧐", "꧑", "꧒", "꧓", "꧔", "꧕", "꧖", "꧗", "꧘", "꧙"],
  Balinese: ["᭐", "᭑", "᭒", "᭓", "᭔", "᭕", "᭖", "᭗", "᭘", "᭙"],
  Sundanese: ["᮰", "᮱", "᮲", "᮳", "᮴", "᮵", "᮶", "᮷", "᮸", "᮹"],
  Bengali: ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"],
  Kannada: ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"],
  "Odia (Oriya)": ["୦", "୧", "୨", "୩", "୪", "୫", "୬", "୭", "୮", "୯"],
  Gurmukhi: ["੦", "੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯"],
  "Devanagari (Formal Nepali/Sanskrit)": ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"],
  Sinhala: ["0", "𑇡", "𑇢", "𑇣", "𑇤", "𑇥", "𑇦", "𑇧", "𑇨", "𑇩"],
  Assamese: ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"],
  Maithili: ["𑒦", "𑒧", "𑒨", "𑒩", "𑒪", "𑒫", "𑒬", "𑒭", "𑒮", "𑒯"],
  "Meitei (Manipuri)": ["꯰", "꯱", "꯲", "꯳", "꯴", "꯵", "꯶", "꯷", "꯸", "꯹"],
  "Persian (Farsi)": ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
  Amharic: ["0", "፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱"],
  Cherokee: ["0", "Ꮱ", "Ꮤ", "Ꭲ", "Ꭳ", "Ꭴ", "Ꭵ", "Ꭶ", "Ꭷ", "Ꭸ"],
  "Inuktitut (Kaktovik)": ["𝋀", "𝋁", "𝋂", "𝋃", "𝋄", "𝋅", "𝋆", "𝋇", "𝋈", "𝋉"],
  "N'Ko": ["߀", "߁", "߂", "߃", "߄", "߅", "߆", "߇", "߈", "߉"],
  Osmanya: ["𐒠", "𐒡", "𐒢", "𐒣", "𐒤", "𐒥", "𐒦", "𐒧", "𐒨", "𐒩"],
  "Thaana (Maldivian)": ["0", "ހ", "ށ", "ނ", "ރ", "ބ", "ޅ", "ކ", "އ", "ވ"],
  "Tifinagh (Berber)": ["0", "ⴰ", "ⴱ", "ⵛ", "ⴷ", "ⴻ", "ⴼ", "ⴳ", "ⵀ", "ⵉ"],
  "New Tai Lue": ["᧐", "᧑", "᧒", "᧓", "᧔", "᧕", "᧖", "᧗", "᧘", "᧙"],
  Chakma: ["𑄶", "𑄷", "𑄸", "𑄹", "𑄺", "𑄻", "𑄼", "𑄽", "𑄾", "𑄿"],
  "Linear B": ["0", "𐄇", "𐄈", "𐄉", "𐄊", "𐄋", "𐄌", "𐄍", "𐄎", "𐄏"],
  "Cypriot Syllabary": ["0", "𐄀", "𐄁", "𐄂", "𐄃", "𐄄", "𐄅", "𐄆", "𐄇", "𐄈"],
  "Lycian": ["0", "𐊡", "𐊢", "𐊣", "𐊤", "𐊥", "𐊦", "𐊧", "𐊨", "𐊩"],
  "Lydian": ["0", "𐤠", "𐤡", "𐤢", "𐤣", "𐤤", "𐤥", "𐤦", "𐤧", "𐤨"],
  "Carian": ["0", "𐊾", "𐋀", "𐋁", "𐋂", "𐋃", "𐋄", "𐋅", "𐋆", "𐋇"],
  "Old Persian (Cuneiform)": ["0", "𐎡", "𐎢", "𐎣", "𐎤", "𐎥", "𐎦", "𐎧", "𐎨", "𐎩"],
  "Elamite": ["0", "𒐕", "𒐖", "𒐗", "𒐘", "𒐙", "𒐚", "𒐛", "𒐜", "𒐝"],
  "Ugaritic": ["0", "𐎟", "𐎠", "𐎡", "𐎢", "𐎣", "𐎤", "𐎥", "𐎦", "𐎧"],
  "Old South Arabian (Sabaean)": ["0", "𐩿", "𐩾", "𐩽", "𐩼", "𐩻", "𐩺", "𐩹", "𐩸", "𐩷"],
  "Hatran": ["0", "𐣠", "𐣡", "𐣢", "𐣣", "𐣤", "𐣥", "𐣦", "𐣧", "𐣨"],
  "Palmyrene": ["0", "𐡠", "𐡡", "𐡢", "𐡣", "𐡤", "𐡥", "𐡦", "𐡧", "𐡨"],
  "Jurchen": ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
  "Khitan Small Script": ["0", "𗈁", "𗈂", "𗈃", "𗈄", "𗈅", "𗈆", "𗈇", "𗈈", "𗈉"],
  "Phags-pa": ["0", "𑜀", "𑜁", "𑜂", "𑜃", "𑜄", "𑜅", "𑜆", "𑜇", "𑜈"],
  "Old Turkic (Orkhon Runes)": ["0", "𐰁", "𐰂", "𐰃", "𐰄", "𐰅", "𐰆", "𐰇", "𐰈", "𐰉"],
  "Nüshu": ["0", "𛈇", "𛈈", "𛈉", "𛈊", "𛈋", "𛈌", "𛈍", "𛈎", "𛈏"],
  "Sui Script (Shuishu)": ["0", "𗵿", "𗶀", "𗶁", "𗶂", "𗶃", "𗶄", "𗶅", "𗶆", "𗶇"],
  "Ahom": ["0", "𑜰", "𑜱", "𑜲", "𑜳", "𑜴", "𑜵", "𑜶", "𑜷", "𑜸"],
  "Khamti Shan": ["0", "ၸ", "ၶ", "1", "2", "3", "4", "5", "6", "7"],
  "Tai Viet": ["0", "ꪀ", "ꪁ", "ꪂ", "ꪃ", "ꪄ", "ꪅ", "ꪆ", "ꪇ", "ꪈ"],
  "Pyu": ["0", "𑾰", "𑾱", "𑾲", "𑾳", "𑾴", "𑾵", "𑾶", "𑾷", "𑾸"],
  "Mon Script": ["0", "𑄿", "𑅀", "𑅁", "𑅂", "𑅃", "𑅄", "𑅅", "𑅆", "𑅇"],
  "Kawi": ["0", "𑀓", "𑀔", "𑀕", "𑀖", "𑀗", "𑀘", "𑀙", "𑀚", "𑀛"],
  "Rejang": ["0", "ꤰ", "ꤱ", "ꤲ", "ꤳ", "ꤴ", "ꤵ", "ꤶ", "ꤷ", "ꤸ"],
  "Lampung": ["0", "ꥆ", "ꥇ", "ꥈ", "ꥉ", "ꥊ", "ꥋ", "ꥌ", "ꥍ", "ꥎ"],
  "Kerinci": ["0", "ꥆ", "ꥇ", "ꥈ", "ꥉ", "ꥊ", "ꥋ", "ꥌ", "ꥍ", "ꥎ"],
  "Zanabazar Square": ["0", "𑨀", "𑨁", "𑨂", "𑨃", "𑨄", "𑨅", "𑨆", "𑨇", "𑨈"],
  "Marchen": ["0", "𑲏", "𑲐", "𑲑", "𑲒", "𑲓", "𑲔", "𑲕", "𑲖", "𑲗"],
  "Lepcha (Róng)": ["0", "ᰰ", "ᰱ", "ᰲ", "ᰳ", "ᰴ", "ᰵ", "ᰶ", "᰷", "᰸"],
  "Limbu": ["ᤠ", "ᤰ", "ᤱ", "ᤲ", "ᤳ", "ᤴ", "ᤵ", "ᤶ", "ᤷ", "ᤸ"],
  "Bhaiksuki": ["0", "𑖀", "𑖁", "𑖂", "𑖃", "𑖄", "𑖅", "𑖆", "𑖇", "𑖈"],
  "Gunjala Gondi": ["0", "𑍐", "𑍑", "𑍒", "𑍓", "𑍔", "𑍕", "𑍖", "𑍗", "𑍘"],
  "Masaram Gondi": ["0", "𑴀", "𑴁", "𑴂", "𑴃", "𑴄", "𑴅", "𑴆", "𑴇", "𑴈"],
  "Halbi": ["0", "𑵐", "𑵑", "𑵒", "𑵓", "𑵔", "𑵕", "𑵖", "𑵗", "𑵘"],
  "Bhatri": ["0", "𑵐", "𑵑", "𑵒", "𑵓", "𑵔", "𑵕", "𑵖", "𑵗", "𑵘"],
  "Gondi (Standard Variant)": ["0", "𑵐", "𑵑", "𑵒", "𑵓", "𑵔", "𑵕", "𑵖", "𑵗", "𑵘"],
  "Ol Chiki": ["᱐", "᱑", "᱒", "᱓", "᱔", "᱕", "᱖", "᱗", "᱘", "᱙"],
  "Warang Chiti": ["0", "𑣠", "𑣡", "𑣢", "𑣣", "𑣤", "𑣥", "𑣦", "𑣧", "𑣨"],
  "Sora Sompeng": ["0", "𑃰", "𑃱", "𑃲", "𑃳", "𑃴", "𑃵", "𑃶", "𑃷", "𑃸"],
  "Dhives Akuru": ["0", "𑤰", "𑤱", "𑤲", "𑤳", "𑤴", "𑤵", "𑤶", "𑤷", "𑤸"],
  "Incan Quipu": ["0", "𝍠", "𝍡", "𝍢", "𝍣", "𝍤", "𝍥", "𝍦", "𝍧", "𝍨"],
  "Cree Syllabics": ["0", "ᐁ", "ᐂ", "ᐉ", "ᐄ", "ᐅ", "ᐆ", "ᐇ", "ᐈ", "ᐉ"],
  "Ojibwe": ["0", "ᐁ", "ᐂ", "ᐉ", "ᐄ", "ᐅ", "ᐆ", "ᐇ", "ᐈ", "ᐉ"],
  "Carrier (Dakelh)": ["0", "ᗀ", "ᗁ", "ᗂ", "ᗃ", "ᗄ", "ᗅ", "ᗆ", "ᗇ", "ᗈ"],
  "Pollard Script (Miao)": ["0", "𖼀", "𖼁", "𖼂", "𖼃", "𖼄", "𖼅", "𖼆", "𖼇", "𖼈"],
  "Pahawh Hmong": ["0", "𖬀", "𖬁", "𖬂", "𖬃", "𖬄", "𖬅", "𖬆", "𖬇", "𖬈"],
  "Bassa Vah": ["0", "𖫐", "𖫑", "𖫒", "𖫓", "𖫔", "𖫕", "𖫖", "𖫗", "𖫘"],
  "Kpelle": ["0", "𖩀", "𖩁", "𖩂", "𖩃", "𖩄", "𖩅", "𖩆", "𖩇", "𖩈"],
  "Loma": ["0", "𖩡", "𖩢", "𖩣", "𖩤", "𖩥", "𖩦", "𖩧", "𖩨", "𖩩"],
  "Medefaidrin": ["0", "𞹂", "3", "4", "5", "6", "7", "8", "9", "10"],
  "Garay": ["0", "𖫐", "𖫑", "𖫒", "𖫓", "𖫔", "𖫕", "𖫖", "𖫗", "𖫘"],
  "Tulu (Tigalari)": ["0", "𑲰", "𑲱", "𑲲", "𑲳", "𑲴", "𑲵", "𑲶", "𑲷", "𑲸"],
  "Grantha (Traditional Malayalam variant)": ["0", "𑍡", "𑍢", "𑍣", "𑍤", "𑍥", "𑍦", "𑍧", "𑍨", "𑍩"],
  "Glagolitic (Angular variant)": ["0", "Ⰰ", "Ⰱ", "Ⰲ", "Ⰳ", "Ⰴ", "Ⰵ", "Ⰶ", "Ⰷ", "Ⰸ"],
  "Cyrillic (Kursive variant)": ["0", "а", "б", "в", "г", "д", "е", "ж", "з", "и"],
  "Avestan": ["0", "𐬀", "𐬁", "𐬂", "𐬃", "𐬄", "𐬅", "𐬆", "𐬇", "𐬈"],
  "Pahlavi (Inscriptional)": ["0", "𐭀", "𐭁", "𐭂", "𐭃", "𐭄", "𐭅", "𐭆", "𐭇", "𐭈"],
  "Parthian (Inscriptional)": ["0", "𐭠", "𐭡", "𐭢", "𐭣", "𐭤", "𐭥", "𐭦", "𐭧", "𐭨"],
  "Sogdian": ["0", "𐼀", "𐼁", "𐼂", "𐼃", "𐼄", "𐼅", "𐼆", "𐼇", "𐼈"],
  "Mathematical Bold": ["𝟎", "𝟏", "𝟐", "𝟑", "𝟒", "𝟓", "𝟔", "𝟕", "𝟖", "𝟗"],
  "Mathematical Double-Struck": ["𝟘", "𝟙", "𝟚", "𝟛", "𝟜", "𝟝", "𝟞", "𝟟", "𝟠", "𝟡"],
  "Mathematical Sans-Serif": ["𝟢", "𝟣", "𝟤", "𝟥", "𝟦", "𝟧", "𝟦", "𝟩", "𝟪", "𝟫"],
  "Mathematical Sans-Serif Bold": ["𝟬", "𝟭", "𝟮", "𝟯", "𝟰", "𝟱", "𝟲", "𝟳", "𝟴", "𝟵"],
  "Mathematical Monospace": ["𝟶", "𝟷", "𝟸", "𝟹", "𝟺", "𝟻", "𝟼", "𝟽", "𝟾", "𝟿"],
  "Circled": ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"],
  "Circled Negative": ["⓿", "❶", "❷", "❸", "❹", "❺", "❻", "❼", "❽", "❾"],
  "Parenthesized": ["(0)", "⑴", "⑵", "⑶", "⑷", "⑸", "⑹", "⑺", "⑻", "⑼"],
  "Full-Stop": ["0.", "⒈", "⒉", "⒊", "⒋", "⒌", "⒍", "⒎", "⒏", "⒐"],
  "Double Circled": ["⓿", "⓵", "⓶", "⓷", "⓸", "⓹", "⓺", "⓻", "⓼", "⓽"],
  "Superscript": ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"],
  "Subscript": ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"],
  "Fullwidth (Romaji)": ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"],
  "Roman Lowercase": ["o", "ⅰ", "ⅱ", "ⅲ", "ⅳ", "ⅴ", "ⅵ", "ⅶ", "ⅷ", "ⅸ"],
  "Braille": ["⠴", "⠂", "⠆", "⠒", "⠲", "⠢", "⠖", "⠶", "⠦", "⠔"],
  "Morse Code": ["-----", ".----", "..---", "...--", "....-", ".....", "-....", "--...", "---..", "----."],
  "Binary": ["0000", "0001", "0010", "0011", "0100", "0101", "0110", "0111", "1000", "1001"],
  "Octal": ["0", "1", "2", "3", "4", "5", "6", "7", "10", "11"],
  "Hexadecimal": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  "Dingbats Sans-Serif Circled": ["🄋", "➀", "➁", "➂", "➃", "➄", "➅", "➆", "➇", "➈"],
  "Dingbats Negative Circled": ["⓿", "➊", "➋", "➌", "➍", "➎", "➏", "➐", "➑", "➒"],
  "Suzhou Numerals": ["〇", "〡", "〢", "〣", "〤", "〥", "〦", "〧", "〨", "〩"],
  "Counting Rods": ["〇", "𝍠", "𝍡", "𝍢", "𝍣", "𝍤", "𝍥", "𝍦", "𝍧", "𝍨"],
  "Adlam": ["𞥐", "𞥑", "𞥒", "𞥓", "𞥔", "𞥕", "𞥖", "𞥗", "𞥘", "𞥙"],
  "Ahom Alternative": ["𑜰", "𑜱", "𑜲", "𑜳", "𑜴", "𑜵", "𑜶", "𑜷", "𑜸", "𑜹"],
  "Bamum": ["꛲", "꛳", "꛴", "꛵", "꛶", "꛷", "꛸", "꛹", "꛺", "꛻"],
  "Bhaiksuki Variant": ["0", "𑖁", "𑖂", "𑖃", "𑖄", "𑖅", "𑖆", "𑖇", "𑖈", "𑖉"],
  "Brahmi": ["0", "𑁒", "𑁓", "𑁔", "𑁕", "𑁖", "𑁗", "𑁘", "𑁙", "𑁚"],
  "Chakma Secondary": ["𑄶", "𑄷", "𑄸", "𑄹", "𑄺", "𑄻", "𑄼", "𑄽", "𑄾", "𑄿"],
  "Cham": ["꩐", "꩑", "꩒", "꩓", "꩔", "꩕", "꩖", "꩗", "꩘", "꩙"],
  "Coptic": ["0", "Ⲁ", "Ⲃ", "Ⲅ", "Ⲇ", "Ⲉ", "Ⲋ", "Ⲍ", "Ⲏ", "Ⲑ"],
  "Cuneiform Numbers": ["0", "𒐕", "𒐖", "𒐗", "𒐘", "𒐙", "𒐚", "𒐛", "𒐜", "𒐝"],
  "Cypro-Minoan": ["0", "𒾐", "𒾑", "𒾒", "𒾓", "𒾔", "𒾕", "𒾖", "𒾗", "𒾘"],
  "Dogri": ["0", "𑠱", "𑠲", "𑠳", "𑠴", "𑠵", "𑠶", "𑠷", "𑠸", "𑠹"],
  "Glagolitic": ["0", "Ⰰ", "Ⰱ", "Ⰲ", "Ⰳ", "Ⰴ", "Ⰵ", "Ⰶ", "Ⰷ", "Ⰸ"],
  "Gondi": ["𑵐", "𑵑", "𑵒", "𑵓", "𑵔", "𑵕", "𑵖", "𑵗", "𑵘", "𑵙"],
  "Gujarati": ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"],
  "Gunjala Gondi Alternate": ["𑍐", "𑍑", "𑍒", "𑍓", "𑍔", "𑍕", "𑍖", "𑍗", "𑍘", "𑍙"],
  "Hanifi Rohingya": ["𐿰", "𐿱", "𐿲", "𐿳", "𐿴", "𐿵", "𐿶", "𐿷", "𐿸", "𐿹"],
  "Kawi Alternate": ["𑀲", "𑀳", "𑀴", "𑀵", "𑀶", "𑀷", "𑀸", "𑀹", "𑀺", "𑀻"],
  "Kayah Li": ["꤀", "꤁", "꤂", "꤃", "꤄", "꤅", "꤆", "꤇", "꤈", "꤉"],
  "Khojki": ["0", "𑈱", "𑈲", "𑈳", "𑈴", "𑈵", "𑈶", "𑈷", "𑈸", "𑈹"],
  "Khudawadi": ["0", "𑊱", "𑊲", "𑊳", "𑊴", "𑊵", "𑊶", "𑊷", "𑊸", "𑊹"],
  "Lao Alternate": ["໐", "໑", "໒", "໓", "໔", "໕", "໖", "໗", "໘", "໙"],
  "Lepcha": ["᱀", "᱁", "᱂", "᱃", "᱄", "᱅", "᱆", "᱇", "᱈", "᱉"],
  "Linear A Variant": ["0", "𐄇", "𐄈", "𐄉", "𐄊", "𐄋", "𐄌", "𐄍", "𐄎", "𐄏"],
  "Lisu (Fraser)": ["0", "ꓡ", "ꓢ", "ꓣ", "ꓤ", "ꓥ", "ꓦ", "ꓧ", "ꓨ", "ꓩ"],
  "Mahajani": ["0", "𑑑", "𑑒", "𑑓", "𑑔", "𑑕", "𑑖", "𑑗", "𑑘", "𑑙"],
  "Makasar": ["0", "𑻱", "𑻲", "𑻳", "𑻴", "𑻵", "𑻶", "𑻷", "𑻸", "𑻹"],
  "Mende Kikakui": ["𞱱", "𞱲", "𞱳", "𞱴", "𞱵", "𞱶", "𞱷", "𞱸", "𞱹", "𞱺"],
  "Mro": ["𖩠", "𖩡", "𖩢", "𖩣", "𖩤", "𖩥", "𖩦", "𖩧", "𖩨", "𖩩"],
  "Multani": ["0", "𑊰", "𑊱", "𑊲", "𑊳", "𑊴", "𑊵", "𑊶", "𑊷", "𑊸"],
  "Myanmar Shan": ["႐", "႑", "႒", "႓", "႔", "႕", "႖", "႗", "႘", "႙"],
  "Myanmar Tai Laing": ["꧰", "꧱", "꧲", "꧳", "꧴", "꧵", "꧶", "꧷", "꧸", "꧹"],
  "Nabataean": ["0", "𐢁", "𐢂", "𐢃", "𐢄", "𐢅", "𐢆", "𐢇", "𐢈", "𐢉"],
  "New Tai Lue Alternate": ["᧐", "᧑", "᧒", "᧓", "᧔", "᧕", "᧖", "᧗", "᧘", "᧙"],
  "Newa": ["𑑐", "𑑑", "𑑒", "𑑓", "𑑔", "𑑕", "𑑖", "𑑗", "𑑘", "𑑙"],
  "Nko Variant": ["߀", "߁", "߂", "߃", "߄", "߅", "߆", "߇", "߈", "߉"],
  "Ogham": ["0", "ᚁ", "ᚂ", "ᚃ", "ᚄ", "ᚅ", "ᚆ", "ᚇ", "ᚈ", "ᚉ"],
  "Ol Chiki Alternate": ["᱐", "᱑", "᱒", "᱓", "᱔", "᱕", "᱖", "᱗", "᱘", "᱙"],
  "Old Italic": ["0", "𐌠", "𐌡", "𐌢", "𐌣", "𐌤", "𐌥", "𐌦", "𐌧", "𐌨"],
  "Old North Arabian": ["0", "𐪀", "𐪁", "𐪂", "𐪃", "𐪄", "𐪅", "𐪆", "𐪇", "𐪈"],
  "Old Permic": ["0", "𐍐", "𐍑", "𐍒", "𐍓", "𐍔", "𐍕", "𐍖", "𐍗", "𐍘"],
  "Old Persian": ["0", "𐎡", "𐎢", "𐎣", "𐎤", "𐎥", "𐎦", "𐎧", "𐎨", "𐎩"],
  "Osage": ["0", "𐒰", "𐒱", "𐒲", "𐒳", "𐒴", "𐒵", "𐒶", "𐒷", "𐒸"],
  "Osmanya Alternate": ["𐒠", "𐒡", "𐒢", "𐒣", "𐒤", "𐒥", "𐒦", "𐒧", "𐒨", "𐒩"],
  "Runic": ["0", "ᛅ", "ᚢ", "ᚦ", "ᚬ", "ᚱ", "ᚴ", "ᚼ", "ᚾ", "ᛁ"],
  "Saurashtra": ["꣐", "꣑", "꣒", "꣓", "꣔", "꣕", "꣖", "꣗", "꣘", "꣙"],
  "Sharada": ["𑇐", "𑇑", "𑇒", "𑇓", "𑇔", "𑇕", "𑇖", "𑇗", "𑇘", "𑇙"],
  "Sinhala Lith": ["𑇳", "𑇴", "𑇵", "𑇶", "𑇷", "𑇸", "𑇹", "𑇺", "𑇻", "𑇼"],
  "Sora Sompeng Alt": ["𑃰", "𑃱", "𑃲", "𑃳", "𑃴", "𑃵", "𑃶", "𑃷", "𑃸", "𑃹"],
  "Syriac": ["0", "ܐ", "ܒ", "ܓ", "ܕ", "ܗ", "ܘ", "ܙ", "ܚ", "ܛ"],
  "Tai Tham": ["᪀", "᪁", "᪂", "᪃", "᪄", "᪅", "᪆", "᪇", "᪈", "᪉"],
  "Tai Tham Hora": ["᪐", "᪑", "᪒", "᪓", "᪔", "᪕", "᪖", "᪗", "᪘", "᪙"],
  "Takri": ["𑛀", "𑛁", "𑛂", "𑛃", "𑛄", "𑛅", "𑛆", "𑛇", "𑛈", "𑛉"],
  "Tamil (Modern)": ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"],
  "Tangsa": ["𖿠", "𖿡", "𖿢", "𖿣", "𖿤", "𖿥", "𖿦", "𖿧", "𖿨", "𖿩"],
  "Telugu": ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"],
  "Tirhuta": ["𑓐", "𑓑", "𑓒", "𑓓", "𑓔", "𑓕", "𑓖", "𑓗", "𑓘", "𑓙"],
  "Vai": ["꘠", "꘡", "꘢", "꘣", "꘤", "꘥", "꘦", "꘧", "꘨", "꘩"],
  "Wancho": ["𑓠", "𑓡", "𑓢", "𑓣", "𑓤", "𑓥", "𑓦", "𑓧", "𑓨", "𑓩"],
  "Elymaic": ["0", "𐿠", "𐿡", "𐿢", "𐿣", "𐿤", "𐿥", "𐿦", "𐿧", "𐿨"],
  "Dveshas": ["0", "𑍡", "𑍢", "𑍣", "𑍤", "𑍥", "𑍦", "𑍧", "𑍨", "𑍩"],
  "Pahawh Hmong Alt": ["𖬠", "𖬡", "𖬢", "𖬣", "𖬤", "𖬥", "𖬦", "𖬧", "𖬨", "𖬩"],
  "Cypro-Minoan Alternate": ["0", "𒾐", "𒾑", "𒾒", "𒾓", "𒾔", "𒾕", "𒾖", "𒾗", "𒾘"],
  "Greek Zero/Math": ["0", "α", "β", "γ", "δ", "ε", "στ", "ζ", "η", "θ"],
  "Phoenician": ["0", "𐤀", "𐤁", "𐤂", "𐤃", "𐤄", "𐤅", "𐤆", "𐤇", "𐤈"],
  "Lydian Alternate": ["0", "𐤠", "𐤡", "𐤢", "𐤣", "𐤤", "𐤥", "𐤦", "𐤧", "𐤨"],
  "Ge'ez Variant": ["0", "፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱"],
  "Rovash": ["0", "𐲀", "𐲁", "𐲂", "𐲃", "𐲄", "𐲅", "𐲆", "𐲇", "𐲈"],
  "Manichaean": ["0", "𐫀", "𐫁", "𐫂", "𐫃", "𐫄", "𐫅", "𐫆", "𐫇", "𐫈"],
  "Psalter Pahlavi": ["0", "𐮀", "𐮁", "𐮂", "𐮃", "𐮄", "𐮅", "𐮆", "𐮇", "𐮈"],
  "Old Hungarian": ["0", "𐳀", "𐳁", "𐳂", "𐳃", "𐳄", "𐳅", "𐳆", "𐳇", "𐳈"],
  "Zanabazar Alt": ["𑨀", "𑨁", "𑨂", "𑨃", "𑨄", "𑨅", "𑨆", "𑨇", "𑨈", "𑨉"],
  "Soyombo": ["0", "𑩐", "𑩑", "𑩒", "𑩓", "𑩔", "𑩕", "𑩖", "𑩗", "𑩘"],
  "SignWriting": ["𝠀", "𝠁", "𝠂", "𝠃", "𝠄", "𝠅", "𝠆", "𝠇", "𝠈", "𝠉"],
  "Miao Alternate": ["𖼀", "𖼁", "𖼂", "𖼃", "𖼄", "𖼅", "𖼆", "𖼇", "𖼈", "𖼉"],
  "Ideographic Telegraph": ["〡", "〢", "〣", "〤", "〥", "〦", "〧", "〨", "〩", "〇"],
  "Nyiakeng Puachue Hmong": ["0", "𞄀", "𞄁", "𞄂", "𞄃", "𞄄", "𞄅", "𞄆", "𞄇", "𞄈"]
};

const languages = Object.keys(languageNumerals);

export default function Calculator({ onResult }: { onResult: (result: string) => void }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [language, setLanguage] = useState("English");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playClickSound = () => {
    if (!isSoundOn) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch(e) {}
  };

  const playGameOverSound = () => {
    if (!isSoundOn) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch(e) {}
  };

  const playWinningSound = () => {
    if (!isSoundOn) return;
    try {
      const ctx = getAudioContext();
      
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.1);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + index * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.1 + 0.15);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + index * 0.1);
        osc.stop(ctx.currentTime + index * 0.1 + 0.15);
      });
    } catch(e) {}
  };

  const translate = (text: string) => {
    if (language === "English" || !text) return text;
    const numerals = languageNumerals[language] || languageNumerals.English;
    return text.replace(/[0-9]/g, (match) => numerals[parseInt(match, 10)]);
  };

  const handleButtonClick = (value: string) => {
    if (value === "=") {
      if (!input) return;
      try {
        const calcResult = eval(input).toString();
        setResult(calcResult);
        playWinningSound();
        onResult(calcResult);
        setInput(calcResult);
      } catch (e) {
        setResult("Error");
        playGameOverSound();
        setInput("");
      }
    } else {
      playClickSound();
      setInput(prev => prev + value);
    }
  };

  const clear = () => {
    playGameOverSound();
    setInput("");
    setResult("");
  };

  const filteredLanguages = languages.filter((lang) =>
    lang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 rounded-3xl bg-[#050510] border border-white/10 text-white w-full max-w-sm mx-auto shadow-[0_0_50px_rgba(79,70,229,0.3)] relative"
    >
      <div className="flex justify-between items-center mb-6 relative">
        <button 
          onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-xs text-white/70"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          {language}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>

        <button
          onClick={() => setIsSoundOn(!isSoundOn)}
          className={cn(
            "p-2 rounded-full border transition-all",
            isSoundOn 
              ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" 
              : "bg-white/5 text-white/40 border-white/10"
          )}
          title={isSoundOn ? "Sound On" : "Sound Off"}
        >
          {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        
        <AnimatePresence>
          {isLangMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-56 max-h-72 flex flex-col z-10 bg-[#0f0f2d] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="p-2 border-b border-white/10 bg-[#0a0a1f]">
                <input
                  type="text"
                  placeholder="Search language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-indigo-500/50 transition-colors"
                  autoFocus
                />
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-1">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map(lang => {
                    const globalIndex = languages.indexOf(lang) + 1;
                    return (
                      <button
                        key={lang}
                        onClick={() => { setLanguage(lang); setIsLangMenuOpen(false); setSearchQuery(""); }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs rounded-lg transition-colors",
                          language === lang ? "bg-indigo-600/30 text-indigo-300" : "hover:bg-white/5 text-white/70"
                        )}
                      >
                        {globalIndex}. {lang}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-4 text-center text-xs text-white/40">No records found</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-right mb-6 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={language + "-input"}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)", position: "absolute", right: 0 }}
            transition={{ duration: 0.3 }}
            className="text-white/50 text-xl font-mono h-8 w-full"
          >
            {translate(input)}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div
            key={language + "-result"}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)", position: "absolute", right: 0, bottom: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-4xl font-black text-cyan-400 mt-2 h-12 w-full"
          >
            {translate(result || "0")}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {buttons.map((btn) => (
          <button 
            key={btn}
            onClick={() => handleButtonClick(btn)}
            className={cn(
              "p-5 rounded-2xl text-xl font-bold transition-all duration-200 relative overflow-hidden flex items-center justify-center",
              "hover:scale-105 active:scale-95",
              btn === "=" ? "bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.5)]" : "bg-white/5 hover:bg-white/10"
            )}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={language + btn}
                initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotateX: 90 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                className="block absolute"
              >
                {translate(btn)}
              </motion.span>
            </AnimatePresence>
          </button>
        ))}
        <button onClick={clear} className="col-span-4 mt-2 p-4 rounded-xl bg-red-900/20 text-red-400 hover:bg-red-900/40 font-bold uppercase tracking-widest text-sm">Clear</button>
      </div>
    </motion.div>
  );
}
