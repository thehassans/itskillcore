import { Document, Page, View, Text, Image, Svg, Circle, Path, Rect, Line, StyleSheet } from "@react-pdf/renderer";

export type CertificateProps = {
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  certificateId: string;
  platformName?: string;
  logoUrl?: string;
  signatureText?: string;
  qrDataUrl?: string;
  note?: string;
  verifyUrl?: string;
  attendancePct?: number;
  homeworkAvg?: number;
};

const PINE = "#063F38";
const INK = "#042B26";
const LIME = "#C9FA52";
const CREAM = "#F4FFE2";
const BORDER = "#DCE6E3";
const DIVIDER = "#E7EFED";
const MUTED = "#526460";
const SLATE = "#64748B";

const s = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#FFFFFF" },
  frame: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  spine: { width: 8.5, height: "100%", flexDirection: "column" },
  spineTop: { height: "78%", width: "100%", backgroundColor: PINE },
  spineBottom: { height: "22%", width: "100%", backgroundColor: LIME },
  sheet: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 28,
    paddingHorizontal: 38,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
    paddingBottom: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 32, height: 32, objectFit: "contain" },
  brand: { fontSize: 11.5, color: PINE, letterSpacing: 2.4, fontFamily: "Helvetica-Bold" },
  subBrand: { fontSize: 7.2, color: MUTED, letterSpacing: 1.5, marginTop: 2, fontFamily: "Helvetica-Bold" },
  registryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: CREAM,
    borderWidth: 1,
    borderColor: "#CEDFD9",
    borderRadius: 99,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  registryDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: PINE },
  registryText: { fontSize: 7.5, color: PINE, fontFamily: "Courier-Bold", letterSpacing: 1 },

  body: { justifyContent: "center", paddingVertical: 14 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyebrowBar: { width: 24, height: 3, borderRadius: 2, backgroundColor: LIME },
  eyebrowText: { fontSize: 9, color: PINE, fontFamily: "Helvetica-Bold", letterSpacing: 2.2 },

  leadIn: { fontSize: 10.5, color: SLATE, marginTop: 14 },
  studentName: {
    fontSize: 34,
    color: INK,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
    letterSpacing: -0.5,
  },
  accentRuleWrap: { marginTop: 10, height: 1.5, width: 240, backgroundColor: DIVIDER },
  accentRuleFill: { height: 1.5, width: 92, backgroundColor: PINE },

  desc: { fontSize: 11, color: MUTED, marginTop: 12, maxWidth: 580, lineHeight: 1.45 },
  courseTitle: { fontSize: 20, color: PINE, fontFamily: "Helvetica-Bold", marginTop: 5 },

  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  meritPill: {
    backgroundColor: CREAM,
    borderWidth: 1,
    borderColor: "#CEDFD9",
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  meritText: { fontSize: 8.5, color: PINE, fontFamily: "Helvetica-Bold" },
  notePill: {
    backgroundColor: "#FAFCFB",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  noteText: { fontSize: 8.5, color: MUTED },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: DIVIDER,
    paddingTop: 14,
  },
  sigCol: { width: 220 },
  sigName: { fontFamily: "Times-Italic", fontSize: 16.5, color: INK },
  sigLine: { width: 175, borderTopWidth: 1, borderTopColor: "#B7CBC6", marginVertical: 5 },
  sigLabel: { fontSize: 7.5, color: MUTED, fontFamily: "Helvetica-Bold", letterSpacing: 1.2 },
  issueDate: { fontSize: 8.5, color: PINE, marginTop: 3, fontFamily: "Helvetica-Bold" },

  sealCol: { width: 110, alignItems: "center" },

  qrCol: { width: 250, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10 },
  qrMeta: { alignItems: "flex-end" },
  qrLabel: { fontSize: 7.2, color: SLATE, fontFamily: "Helvetica-Bold", letterSpacing: 1.1 },
  qrId: { fontSize: 10, color: INK, fontFamily: "Courier-Bold", marginTop: 2 },
  qrUrl: { fontSize: 7.2, color: PINE, fontFamily: "Courier", marginTop: 2 },
  qrBox: {
    width: 48,
    height: 48,
    padding: 3,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  qrImg: { width: "100%", height: "100%" },
});

/** Vector Architectural Pine & Lime Seal matching GoldenSeal.tsx */
function ArchitecturalSealPDF() {
  const ticks = Array.from({ length: 24 }, (_, idx) => {
    const angle = (idx * 15 * Math.PI) / 180;
    const isMajor = idx % 2 === 0;
    const rOuter = 41;
    const rInner = isMajor ? 37.5 : 39;
    return {
      x1: (50 + Math.cos(angle) * rInner).toFixed(1),
      y1: (50 + Math.sin(angle) * rInner).toFixed(1),
      x2: (50 + Math.cos(angle) * rOuter).toFixed(1),
      y2: (50 + Math.sin(angle) * rOuter).toFixed(1),
      isMajor,
    };
  });

  return (
    <View style={{ width: 84, height: 84, alignItems: "center", justifyContent: "center", position: "relative" }}>
      <Svg width="84" height="84" viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="46" fill={CREAM} stroke="#CEDFD9" strokeWidth="1" />
        <Circle cx="50" cy="50" r="42.5" fill={PINE} />
        {ticks.map((t, i) => (
          <Line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.isMajor ? LIME : CREAM}
            strokeWidth={t.isMajor ? "1.1" : "0.6"}
          />
        ))}
        <Circle cx="50" cy="50" r="25.5" fill={INK} stroke={LIME} strokeWidth="0.9" />
        <Path fill={LIME} d="M 40.5 53 L 46.5 41 H 52.5 L 46.5 53 Z" />
        <Circle fill={LIME} cx="52" cy="36.5" r="2.6" />
        <Path fill={CREAM} d="M 49 53 L 53.6 43.5 H 57.8 L 53.2 53 Z" />
        <Rect x="29" y="58" width="42" height="9.5" rx="4.5" fill={CREAM} />
      </Svg>
      <Text
        style={{
          position: "absolute",
          top: 14.5,
          fontSize: 4.7,
          color: CREAM,
          fontFamily: "Helvetica-Bold",
          letterSpacing: 1.1,
        }}
      >
        IT SKILLCORE
      </Text>
      <Text
        style={{
          position: "absolute",
          top: 51,
          fontSize: 4.5,
          color: PINE,
          fontFamily: "Helvetica-Bold",
          letterSpacing: 1.1,
        }}
      >
        VERIFIED
      </Text>
      <Text
        style={{
          position: "absolute",
          top: 65,
          fontSize: 4.1,
          color: LIME,
          fontFamily: "Helvetica-Bold",
          letterSpacing: 0.9,
        }}
      >
        OFFICIAL SEAL
      </Text>
    </View>
  );
}

export function CertificatePDF(p: CertificateProps) {
  return (
    <Document title={`Certificate - ${p.studentName}`}>
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={s.frame}>
          {/* Left Spine */}
          <View style={s.spine}>
            <View style={s.spineTop} />
            <View style={s.spineBottom} />
          </View>

          <View style={s.sheet}>
            {/* Header */}
            <View style={s.header}>
              <View style={s.headerLeft}>
                {p.logoUrl ? <Image src={p.logoUrl} style={s.logo} /> : null}
                <View>
                  <Text style={s.brand}>{(p.platformName ?? "IT SkillCore").toUpperCase()}</Text>
                  <Text style={s.subBrand}>ACCREDITED COHORT CREDENTIAL</Text>
                </View>
              </View>
              <View style={s.registryPill}>
                <View style={s.registryDot} />
                <Text style={s.registryText}>OFFICIAL REGISTRY</Text>
              </View>
            </View>

            {/* Body */}
            <View style={s.body}>
              <View style={s.eyebrowRow}>
                <View style={s.eyebrowBar} />
                <Text style={s.eyebrowText}>CERTIFICATE OF COMPLETION</Text>
              </View>

              <Text style={s.leadIn}>This credential certifies that</Text>
              <Text style={s.studentName}>{p.studentName}</Text>

              <View style={s.accentRuleWrap}>
                <View style={s.accentRuleFill} />
              </View>

              <Text style={s.desc}>
                has fulfilled all live cohort sessions, capstone deliverables, and technical evaluations for
              </Text>
              <Text style={s.courseTitle}>{p.courseTitle}</Text>

              {(p.attendancePct != null || p.homeworkAvg != null || p.note) ? (
                <View style={s.badgeRow}>
                  {(p.attendancePct != null || p.homeworkAvg != null) ? (
                    <View style={s.meritPill}>
                      <Text style={s.meritText}>
                        {[
                          "VERIFIED MERIT",
                          p.attendancePct != null ? `${p.attendancePct}% ATTENDANCE` : null,
                          p.homeworkAvg != null ? `${p.homeworkAvg}% CAPSTONE` : null,
                        ]
                          .filter(Boolean)
                          .join("  ·  ")}
                      </Text>
                    </View>
                  ) : null}
                  {p.note ? (
                    <View style={s.notePill}>
                      <Text style={s.noteText}>{p.note}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>

            {/* Footer */}
            <View style={s.footer}>
              <View style={s.sigCol}>
                <Text style={s.sigName}>{p.signatureText ?? "Director of Academics"}</Text>
                <View style={s.sigLine} />
                <Text style={s.sigLabel}>AUTHORISED SIGNATURE</Text>
                <Text style={s.issueDate}>Issued {p.issuedAt}</Text>
              </View>

              <View style={s.sealCol}>
                <ArchitecturalSealPDF />
              </View>

              <View style={s.qrCol}>
                <View style={s.qrMeta}>
                  <Text style={s.qrLabel}>REGISTRY VERIFICATION</Text>
                  <Text style={s.qrId}>{p.certificateId}</Text>
                  <Text style={s.qrUrl}>{p.verifyUrl ?? `/verify/${p.certificateId}`}</Text>
                </View>
                {p.qrDataUrl ? (
                  <View style={s.qrBox}>
                    <Image src={p.qrDataUrl} style={s.qrImg} />
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
