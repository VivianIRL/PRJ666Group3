-- ==========================================
-- Community replies (additive migration) — run AFTER supabase_migration.sql.
--
-- community_qa only ever had a single `answer` column (one admin reply per
-- post), but the Community page's UI already renders a full reply thread
-- per post — those replies were never persisted, only held in local React
-- state and lost on refresh. This adds a real table so replies survive a
-- reload, plus the DELETE policies neither table had (posts could be read
-- and created, but never removed by their own author).
-- ==========================================

BEGIN;

CREATE TABLE IF NOT EXISTS community_replies (
    reply_id    SERIAL PRIMARY KEY,
    qa_id       INT NOT NULL REFERENCES community_qa(qa_id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(user_id) ON DELETE SET NULL,
    reply_text  TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_replies_qa ON community_replies(qa_id);

ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read replies" ON community_replies;
CREATE POLICY "Anyone can read replies" ON community_replies
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert own replies" ON community_replies;
CREATE POLICY "Users can insert own replies" ON community_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own replies" ON community_replies;
CREATE POLICY "Users can delete own replies" ON community_replies
  FOR DELETE USING (auth.uid() = user_id);

-- community_qa had SELECT + INSERT policies but no DELETE — needed so a
-- user can remove their own post.
DROP POLICY IF EXISTS "Users can delete own community posts" ON community_qa;
CREATE POLICY "Users can delete own community posts" ON community_qa
  FOR DELETE USING (auth.uid() = user_id);

COMMIT;

NOTIFY pgrst, 'reload schema';
