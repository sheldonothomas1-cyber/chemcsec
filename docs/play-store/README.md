# Putting ChemCSEC on Google Play

Everything Google Play asks for is in this folder or built automatically. Copy and paste from
here into the Play Console (play.google.com/console).

| What Play asks for | Where it is |
| --- | --- |
| App bundle (.aab) | Built by every push to `main`. Download **ChemCSEC.aab** from the latest release on GitHub: https://github.com/sheldonothomas1-cyber/chemcsec/releases/latest |
| App icon, 512 × 512 | `icon-512.png` |
| Feature graphic, 1024 × 500 | `feature-1024x500.png` |
| Phone screenshots (2–8), 1080 × 1920 | `screenshots/` (use all 8, in order) |
| Privacy policy URL | https://sheldonothomas1-cyber.github.io/chemcsec/privacy.html |
| Store text, form answers | Below |

To redraw the graphics after changing the icon: `node scripts/make-play-graphics.mjs`.

---

## Step by step

### 1. Create the developer account (once, about $25)
1. Go to play.google.com/console and sign in with the Google account that should own the app.
2. Choose **Yourself** (a personal account), pay the one-time $25 fee, and complete identity
   verification. Google may ask for a photo ID and verifies the phone number; this can take a few days.
3. Set a **developer email** that will appear on the store page. It can be a new Gmail address
   made just for the app if you would rather not show your personal one.

### 2. Create the app
1. **Create app** → App name `ChemCSEC: CSEC Chemistry` → Default language English (United Kingdom)
   or English (United States) → **App** → **Free**.
2. Tick the declarations and create it.

### 3. Fill in "Set up your app" (the dashboard lists each task)
Use the answers in [Form answers](#form-answers) below.

### 4. Upload the app bundle and start the closed test
1. **Test and release → Testing → Closed testing → Create track** (or use the default
   "Closed testing - Alpha").
2. **Testers**: create an email list with at least **12 people** (their Gmail addresses). Friends,
   classmates, family and teachers are fine. Each one must have an Android phone.
3. **Create new release**. When asked about app signing, accept **Let Google manage and protect
   your app signing key** (the default). Upload `ChemCSEC.aab`.
4. Release name: leave the default. Release notes: `First test release.`
5. **Review release → Start rollout to Closed testing**. Google reviews it (hours to a few days).
6. When it is approved, copy the **opt-in link** from the Testers tab and send it to your testers.
   Each tester opens the link, taps **Become a tester**, then installs ChemCSEC from Play.

### 5. Keep 12 testers for 14 days in a row
- At least 12 testers must stay opted in for 14 continuous days. Ask them to actually open the app
  and use it a few times; Google asks what testers thought when you apply.
- To ship fixes during the test, upload a newer `ChemCSEC.aab` to the same closed track
  (every push to `main` builds one with a higher version number).

### 6. Apply for production
After 14 days the dashboard shows **Apply for production**. Google asks a few questions about the
test (how you recruited testers, what feedback you got, what you changed). Suggested answers:
- *How did you recruit testers?* Classmates, friends and teachers preparing for or teaching CSEC Chemistry.
- *What feedback did you get?* Fill in what testers actually said.
- *What changed?* List any fixes you shipped during the test, or say the build was stable.

Once approved, **Production → Create new release**, upload the latest `ChemCSEC.aab`, choose
countries (all, or start with the Caribbean CSEC countries), and roll out.

### Updates after launch
Every push to `main` builds a new `ChemCSEC.aab`. Upload it as a new Production release. The Play
version never offers APK downloads or GitHub update notices; Play delivers its updates.

### Good to know
- **APK and Play versions are separate installs.** Google signs the Play version with its own key,
  so a phone that has the APK must uninstall it before installing from Play. Progress does not carry
  over by itself: use **Settings → Save a backup** first, then **Restore a backup** in the Play version.
- **"Report this reply"** under every AI tutor reply opens a pre-filled GitHub issue. Play requires
  apps with AI-generated content to let people report it. Reports arrive in the repository's Issues tab.

---

## Store listing

**App name** (max 30)
```
ChemCSEC: CSEC Chemistry
```

**Short description** (max 80)
```
CSEC Chemistry lessons, practice, a virtual lab and mock exams. Works offline.
```

**Full description** (max 4000)
```
ChemCSEC is a free study app for CXC CSEC Chemistry. It covers the whole syllabus, works with no data, and works out what you need to practise next.

TEN QUESTIONS A DAY
• Start today's session and answer about ten questions in ten minutes.
• Every answer comes with a clear explanation of the right method and the common mistake.
• The app tracks how well you know each syllabus objective and brings skills back just before you would forget them (spaced review).

LESSONS FOR EVERY TOPIC
• All 18 topics in Sections A, B and C, from atomic structure and the mole to organic chemistry and qualitative analysis.
• Diagrams you can interact with: shells, bonding, molecules, electrolysis and more.
• Hand-picked video lessons for each topic, checked for accuracy.

FOCUS AREAS FOR THE HARDEST TOPICS
Study guides, worked methods, drills and timed papers for Atomic Structure and Bonding, the Mole Concept, Acids, Bases and Salts, Electrochemistry, Organic Chemistry, Qualitative Analysis and Titrations.

VIRTUAL LAB
Do mock experiments safely: react metals with water and acid, try displacement reactions, test for cations and anions, run electrolysis cells, watch rates of reaction and carry out a titration. Predict first, then see what happens.

FULL PERIODIC TABLE
All 118 elements. Tap any element to see its shells, properties, usual ion and what CSEC expects you to know about it.

MOCK EXAMS THAT CHANGE EVERY TIME
• Paper 01-style multiple-choice papers built from the syllabus weighting, different every time.
• Three difficulty levels, so papers get harder as you improve.
• Paper 02-style structured questions with mark schemes.
• A grade estimate based on your mock results.

AND MORE
• Calculators for formula mass, moles and balancing equations.
• Quick reference sheets: ions, solubility, tests for gases and ions.
• An optional AI tutor (bring your own free Google Gemini key) that explains step by step and checks you understood.
• Backup and restore, so you never lose your progress.

PRIVATE BY DESIGN
No account, no ads, no tracking. Your progress stays on your phone.

ChemCSEC is an independent study app and is not affiliated with or endorsed by the Caribbean Examinations Council (CXC). CSEC is a trademark of CXC.
```

**App category**: Education
**Tags** (pick up to 5 if offered): Education, Science, Exam prep, Chemistry, Study
**Contact details**: your developer email; website `https://sheldonothomas1-cyber.github.io/chemcsec/`

---

## Form answers

### Privacy policy
`https://sheldonothomas1-cyber.github.io/chemcsec/privacy.html`

### App access
**All functionality is available without special access.** (No login.)

### Ads
**No, my app does not contain ads.**

### Content rating (IARC questionnaire)
- Email: your developer email. Category: **Reference, News, or Educational**.
- Violence, sexuality, language, controlled substances, gambling: **No** to all.
  (The lab shows ordinary school chemistry reactions; there is no drug or weapon content.)
- Does the app let users interact or exchange content with other users? **No.**
- Does the app share the user's current location? **No.**
- Does the app allow purchases of digital goods? **No.**
- If asked about AI or generated content: **Yes**, an optional AI chatbot tutor that answers
  chemistry questions; users can report replies in the app.
- Expected result: rated for everyone (e.g. PEGI 3 / ESRB Everyone).

### Target audience and content
- Target age groups: **13–15, 16–17, 18 and over.** (Do not tick any under-13 group; that would put
  the app under the Families policy, which the AI tutor does not meet.)
- Could the app unintentionally appeal to children? **No** (it is an exam study app for secondary students).

### News app
**No.**

### Data safety
Answer the overview questions like this:
- Does your app collect or share any of the required user data types? **Yes**
  (only because the optional AI tutor sends messages to Google or Anthropic).
- Is all of the user data collected by your app encrypted in transit? **Yes** (HTTPS only).
- Do you provide a way for users to request that their data be deleted? **No**
  (the developer holds no user data; everything else is on the device and deleted with the app).

Then declare one data type:

| Data type | Collected | Shared | Optional? | Processed ephemerally? | Purpose |
| --- | --- | --- | --- | --- | --- |
| **App activity → Other user-generated content** (AI tutor messages) | Yes | No* | Yes, optional | No | App functionality |

\*Not "shared": the learner sends the message themselves, to the AI service whose key they entered.
Google's form treats user-initiated transfers like this as not shared.

Everything else (progress, name, exam date) stays on the device and is never sent off it, so it
is **not** declared. Lesson videos are played by YouTube's own player only when a learner opens them.

### Government apps, financial features, health
**No** / **None** / **None**.

### Advertising ID
**No**, the app does not use an advertising ID.
