"use client";
import { Flame, Trophy, Award, CheckCircle2, Zap } from "lucide-react";

export default function LeaderboardPanel({
  leaderboard,
  me,
}: {
  leaderboard: any[];
  me: any | null;
}) {
  return (
    <div className="space-y-6">
      {/* Personal Streak Summary Banner */}
      {me && (
        <div className="card border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#C9FA52]/45 text-[#063F38]">
                <Flame size={30} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#063F38]">
                  Mon–Fri Live Attendance Streak
                </p>
                <h2 className="h-display text-2xl font-extrabold text-slate-900">
                  {me.currentStreak}-Day Active Streak · Rank #{me.rank}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Longest Streak: <b>{me.longestStreak} days</b> · On-Time Homework:{" "}
                  <b>{me.onTimeHomework}</b> · Quizzes Passed: <b>{me.quizzesPassed}</b>
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Weekly Cohort Score
              </span>
              <p className="font-mono text-3xl font-extrabold text-[#063F38]">{me.points} XP</p>
            </div>
          </div>

          {me.badges?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-100">
              {me.badges.map((b: string) => (
                <span
                  key={b}
                  className="badge bg-[#F4FFE2] border border-[#063F38]/20 text-[#063F38] text-xs font-bold"
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cohort Leaderboard Table */}
      <div className="card overflow-hidden border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
              <Trophy size={19} className="text-[#063F38]" />
              Weekly Cohort Leaderboard
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Earn points for Mon–Fri live attendance (+20), active streaks (+15/day), on-time homework (+30), and passed quizzes (+25).
            </p>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-400">
            Leaderboard populates as cohort students join live sessions and submit homework.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500">
                  <th className="p-4">Rank</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Streak</th>
                  <th className="p-4">Live Classes</th>
                  <th className="p-4">On-Time HW</th>
                  <th className="p-4">Badges</th>
                  <th className="p-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row: any) => (
                  <tr
                    key={row.studentId}
                    className={`border-b border-slate-50 last:border-0 transition ${
                      row.isMe ? "bg-[#F4FFE2]/70 font-semibold" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <td className="p-4 font-mono font-bold text-slate-800">
                      {row.rank === 1 ? (
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <Trophy size={15} /> #1
                        </span>
                      ) : row.rank <= 3 ? (
                        <span className="inline-flex items-center gap-1 text-[#063F38]">
                          <Award size={15} /> #{row.rank}
                        </span>
                      ) : (
                        `#${row.rank}`
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#C9FA52]/40 text-xs font-bold text-[#063F38]">
                          {row.name?.charAt(0) || "S"}
                        </span>
                        <span className="text-slate-900">
                          {row.name}{" "}
                          {row.isMe && (
                            <span className="ml-1 badge bg-[#063F38] text-white text-[10px]">
                              YOU
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#063F38]">
                        <Flame size={13} /> {row.currentStreak}d
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" /> {row.attendanceCount}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Zap size={13} className="text-[#063F38]" /> {row.onTimeHomework}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {row.badges?.slice(0, 2).map((b: string) => (
                          <span
                            key={b}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono font-extrabold text-[#063F38]">
                      {row.points} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
