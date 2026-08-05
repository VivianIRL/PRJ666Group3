-- ==========================================
-- Populate the three content_db rows seeded in supabase_migration.sql
-- (Welcome, Immigration Guide, Housing Tips) with real, section-structured
-- body text.
--
-- Data-only — no schema change, safe to run any time. content_db has no
-- structured "sections" column, so each section is marked with a
-- "## Heading" line — the frontend (ArticleView.jsx's parseSections) splits
-- on that same convention to give these the identical multi-section +
-- table-of-contents layout as the hand-written static articles (SIN, health
-- card, study permit extension). Matched by title + page_name so this only
-- ever touches those three original rows.
-- ==========================================

UPDATE content_db
SET body_content = '## What is SettleCAN
SettleCAN is a settlement companion built for newcomers to Canada, whether you''re arriving as an international student, a work permit holder, a permanent resident, a protected person, or a visitor. Moving to a new country means juggling a long list of one-time and recurring tasks — this app brings all of it into one place.

## Start with My Tasks
As soon as your immigration status is set on your profile, SettleCAN generates a personalized checklist of the settlement tasks that apply to you, broken into subtasks with optional due dates. Set a date on anything and you will be reminded automatically as it approaches — no separate step required.

## Check Compliance
The Compliance page shows the permit conditions and legal obligations tied to your specific status, generated the same way as your tasks so they stay in sync with what you have already reviewed.

## Calendar & Document Alerts
Use the Calendar to see every upcoming task deadline and document expiry date in one view, and Document Alerts to track the expiry dates of your passport, permit, and other key documents.

## Guides & Community
Browse Guides & Articles for step-by-step instructions on common processes — SIN, health card, bank account, permit renewal, tax filing — and Community to ask questions and swap advice with other newcomers who have gone through the same steps.

Take a few minutes to fill out your profile accurately — your immigration status and arrival date are what drive the personalized checklist and reminders throughout the app.',
    last_updated = now()
WHERE title = 'Welcome' AND page_name = 'Landing Page';

UPDATE content_db
SET body_content = '## Temporary Residence
Temporary residence covers study permits, work permits, and visitor status. A study permit lets you study at a Designated Learning Institution (DLI) and, in most cases, work off-campus part-time. A work permit is either employer-specific (tied to one employer, occupation, and sometimes location) or open (allows you to work for almost any employer). Visitors do not have automatic work or study authorization.

## Permanent Residence
Permanent residence is most commonly reached through Express Entry — a points-based system (the Comprehensive Ranking System, or CRS) covering the Federal Skilled Worker, Canadian Experience Class, and Federal Skilled Trades programs — or through a Provincial Nominee Program (PNP), where a province nominates candidates for PR based on its own labour-market needs.

## Family & Refugee Pathways
Family sponsorship (spouses, partners, dependent children, and parents/grandparents) and the refugee and protected persons stream are separate pathways with their own eligibility rules and processing streams, distinct from the points-based economic programs above.

## Timing & Renewals
Apply for renewals or extensions well before your current document expires — IRCC recommends starting at least 30 to 90 days ahead depending on the permit type. If you apply to extend a work or study permit before it expires, you generally continue under "implied status" while the application is processed, but you cannot travel outside Canada and re-enter under implied status. Processing times vary by application type and change frequently — always check IRCC''s official processing time tool for a current estimate rather than relying on a fixed number.

## Where to Go Next
Keep copies of every document you submit, and keep your contact information — especially your address — up to date in your IRCC account; you are required to report an address change within 180 days. For the specific steps involved in a particular process, see the dedicated guides on the Guides & Articles page — this overview is a starting map, not a replacement for your own application''s instructions.',
    last_updated = now()
WHERE title = 'Immigration Guide' AND page_name = 'Guide';

-- Structure mirrors the Government of Canada's own newcomer housing
-- section (canada.ca/en/immigration-refugees-citizenship/services/settle-canada/housing/
-- overview.html, .../renting.html, .../other-housing.html): rental housing
-- types and what to weigh when choosing where to live, then renting/tenant
-- rights, then non-rental options — rather than a generic listicle.
UPDATE content_db
SET body_content = '## Rental Housing Types
Most newcomers start in a rental. Common types include apartment buildings, renting a house, condominiums, subletting (taking over someone else''s lease for a period), and shared or room rentals, where you rent a room in a house or apartment with other tenants.

## Things to Consider
Budget for both your immediate housing needs and the longer term — including any temporary housing you need while you search. Housing costs vary significantly by province, territory, city, and even neighbourhood, so research the areas you''re considering before committing. Communities also vary: large metropolitan cities, smaller towns, and rural areas each offer a different pace of life and different levels of cultural and language diversity, which is worth weighing alongside cost.

## Renting: Know Your Rights
Your landlord is the person who owns the building you live in — they may also hire a property manager or superintendent to collect rent and manage the property day to day. Both you and your landlord have legal rights and responsibilities once you sign a rental agreement, and each province and territory has its own residential tenancy act setting out what each side must do.

As a tenant, you have the right to a safe, well-maintained home; to receive proper written notice (at least 24 hours in most provinces and territories) before your landlord enters your unit; to be treated fairly without discrimination; and to receive written notice of any rent increase or eviction. It is illegal for anyone to pressure you into doing something you don''t want to do in exchange for rent. If a rental situation feels wrong, contact a newcomer services provider for help.

## Other Forms of Housing
If your income makes it hard to afford market rent, you may qualify for community housing — subsidized housing that newcomers, including refugees, can apply for by joining a waiting list. When you first arrive, many newcomers stay somewhere temporary — a hotel, hostel, short-term rental, or with a friend, family member, or host family — while they settle in and search for something longer-term. Shelters and transitional housing are also available if you need them.

## Housing Resources
Local newcomer and settlement service providers are often the best starting point for housing help — they maintain up-to-date community housing information and can point you toward organizations, listings, and supports specific to your city.',
    last_updated = now()
WHERE title = 'Housing Tips' AND page_name = 'Housing Tips';
