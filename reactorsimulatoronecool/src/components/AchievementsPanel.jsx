import useReactorStore, { ACHIEVEMENTS } from '../store/reactorStore';

export default function AchievementsPanel() {
  const { achievements } = useReactorStore();

  const unlockedCount = achievements.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Achievements</span>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
          {unlockedCount}/{totalCount}
        </span>
      </div>
      <div className="panel-content">
        <div className="achievements-grid">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = achievements.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`achievement ${isUnlocked ? 'unlocked' : ''}`}
                title={achievement.desc}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-name">{achievement.name}</div>
                {isUnlocked && (
                  <div className="achievement-desc">{achievement.desc}</div>
                )}
              </div>
            );
          })}
        </div>

        {unlockedCount === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              color: 'var(--text-dim)',
              fontSize: '12px',
            }}
          >
            No achievements yet. Start causing some chaos!
          </div>
        )}

        {unlockedCount > 0 && unlockedCount < totalCount && (
          <div
            style={{
              marginTop: '15px',
              padding: '10px',
              background: 'var(--bg-panel-light)',
              borderRadius: '4px',
              fontSize: '11px',
              color: 'var(--text-secondary)',
            }}
          >
            <strong>Tip:</strong> Try disabling safety systems and using
            Unstablium-666 fuel for more achievements!
          </div>
        )}

        {unlockedCount === totalCount && (
          <div
            style={{
              marginTop: '15px',
              padding: '15px',
              background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)',
              border: '1px solid gold',
              borderRadius: '6px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
            <div
              style={{
                fontFamily: 'Orbitron',
                fontSize: '14px',
                fontWeight: '700',
                color: 'gold',
              }}
            >
              ALL ACHIEVEMENTS UNLOCKED!
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                marginTop: '4px',
              }}
            >
              You are a true chaos engineer!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
