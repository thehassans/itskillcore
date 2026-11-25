import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

export type FeeInvoiceProps = {
  invoiceNumber: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  batchCode: string;
  monthLabel: string;
  installmentNumber: number;
  amountPKR: number;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  dueDate: string;
  issuedAt: string;
  verifiedAt?: string;
  couponCode?: string;
  logoUrl?: string;
};

const PINE = "#063F38";
const INK = "#042B26";
const LIME = "#C9FA52";
const CREAM = "#F4FFE2";
const BORDER = "#DCE6E3";
const MUTED = "#526460";

const s = StyleSheet.create({
  page: { padding: 28, backgroundColor: "#FFFFFF" },
  card: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  spine: { width: 8, height: "100%", flexDirection: "column" },
  spineTop: { height: "80%", width: "100%", backgroundColor: PINE },
  spineBot: { height: "20%", width: "100%", backgroundColor: LIME },
  sheet: { flex: 1, padding: 34, justifyContent: "space-between" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#E7EFED",
    paddingBottom: 18,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 32, height: 32, objectFit: "contain" },
  brand: { fontSize: 13, fontFamily: "Helvetica-Bold", color: PINE, letterSpacing: 1.5 },
  sub: { fontSize: 8, color: MUTED, marginTop: 2 },

  invMeta: { alignItems: "flex-end" },
  invTag: {
    backgroundColor: CREAM,
    borderWidth: 1,
    borderColor: "#CEDFD9",
    borderRadius: 99,
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 7.5,
    fontFamily: "Courier-Bold",
    color: PINE,
  },
  invNo: { fontSize: 12, fontFamily: "Courier-Bold", color: INK, marginTop: 6 },
  invDate: { fontSize: 8, color: MUTED, marginTop: 2 },

  grid: { flexDirection: "row", justifyContent: "space-between", marginTop: 22, gap: 20 },
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FAFCFB",
  },
  boxLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 1.2 },
  boxVal: { fontSize: 11, fontFamily: "Helvetica-Bold", color: INK, marginTop: 4 },
  boxSub: { fontSize: 8.5, color: MUTED, marginTop: 2 },

  table: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    overflow: "hidden",
  },
  tHead: {
    flexDirection: "row",
    backgroundColor: "#F4F8F7",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  th: { fontSize: 8, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 0.8 },
  tRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  tdDesc: { flex: 2.5 },
  tdQty: { flex: 1, textAlign: "center", fontSize: 9.5, color: MUTED },
  tdAmt: { flex: 1.2, textAlign: "right", fontSize: 10.5, fontFamily: "Courier-Bold", color: INK },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: CREAM,
    borderTopWidth: 1,
    borderTopColor: "#CEDFD9",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  totalLabel: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: PINE },
  totalAmt: { fontSize: 14, fontFamily: "Courier-Bold", color: PINE },

  statusBox: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#CEDFD9",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E7EFED",
    paddingTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footText: { fontSize: 8, color: MUTED, lineHeight: 1.4 },
});

export function FeeInvoicePDF(p: FeeInvoiceProps) {
  const paid = p.status === "VERIFIED";
  return (
    <Document title={`Invoice ${p.invoiceNumber} - ${p.studentName}`}>
      <Page size="A4" style={s.page}>
        <View style={s.card}>
          <View style={s.spine}>
            <View style={s.spineTop} />
            <View style={s.spineBot} />
          </View>

          <View style={s.sheet}>
            <View>
              {/* Header */}
              <View style={s.header}>
                <View style={s.brandRow}>
                  {p.logoUrl ? <Image src={p.logoUrl} style={s.logo} /> : null}
                  <View>
                    <Text style={s.brand}>IT SKILLCORE</Text>
                    <Text style={s.sub}>Gulberg III, Lahore · Live Cohort Academy</Text>
                    <Text style={s.sub}>accounts@itskillcore.pk · itskillcore.pk</Text>
                  </View>
                </View>
                <View style={s.invMeta}>
                  <Text style={s.invTag}>
                    {paid ? "OFFICIAL PAID RECEIPT" : `TUITION INVOICE · ${p.status}`}
                  </Text>
                  <Text style={s.invNo}>{p.invoiceNumber}</Text>
                  <Text style={s.invDate}>Issued {p.issuedAt}</Text>
                </View>
              </View>

              {/* Billed To & Cohort Details */}
              <View style={s.grid}>
                <View style={s.box}>
                  <Text style={s.boxLabel}>BILLED TO STUDENT</Text>
                  <Text style={s.boxVal}>{p.studentName}</Text>
                  <Text style={s.boxSub}>{p.studentEmail}</Text>
                </View>
                <View style={s.box}>
                  <Text style={s.boxLabel}>COHORT PROGRAM</Text>
                  <Text style={s.boxVal}>{p.courseTitle}</Text>
                  <Text style={s.boxSub}>
                    {p.batchCode}
                    {p.couponCode ? ` · Code: ${p.couponCode}` : ""}
                  </Text>
                </View>
              </View>

              {/* Line Items */}
              <View style={s.table}>
                <View style={s.tHead}>
                  <Text style={[s.th, { flex: 2.5 }]}>TUITION INSTALLMENT</Text>
                  <Text style={[s.th, { flex: 1, textAlign: "center" }]}>DUE DATE</Text>
                  <Text style={[s.th, { flex: 1.2, textAlign: "right" }]}>AMOUNT (PKR)</Text>
                </View>
                <View style={s.tRow}>
                  <View style={s.tdDesc}>
                    <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: INK }}>
                      {p.monthLabel}
                    </Text>
                    <Text style={{ fontSize: 8.5, color: MUTED, marginTop: 2 }}>
                      Installment #{p.installmentNumber} · Payment Channel: {p.paymentMethod}
                      {p.transactionId ? ` · TID: ${p.transactionId}` : ""}
                    </Text>
                  </View>
                  <Text style={s.tdQty}>{p.dueDate}</Text>
                  <Text style={s.tdAmt}>PKR {p.amountPKR.toLocaleString()}</Text>
                </View>
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>
                    {paid ? "TOTAL PAID & VERIFIED" : "TOTAL AMOUNT DUE"}
                  </Text>
                  <Text style={s.totalAmt}>PKR {p.amountPKR.toLocaleString()}</Text>
                </View>
              </View>

              {/* Verification Summary */}
              <View
                style={[
                  s.statusBox,
                  { backgroundColor: paid ? CREAM : "#FAFCFB" },
                ]}
              >
                <View>
                  <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: PINE }}>
                    PAYMENT STATUS: {p.status}
                  </Text>
                  <Text style={{ fontSize: 8.5, color: MUTED, marginTop: 2 }}>
                    {paid && p.verifiedAt
                      ? `Verified by IT SkillCore Accounts on ${p.verifiedAt}`
                      : "Settle via JazzCash (0300-1234567), EasyPaisa (0345-7654321), or Meezan Bank IBAN."}
                  </Text>
                </View>
                <Text style={{ fontSize: 8, fontFamily: "Courier-Bold", color: PINE }}>
                  {paid ? "CLEARED" : "DUE"}
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={s.footer}>
              <Text style={s.footText}>
                This document is electronically issued by IT SkillCore Accounts &amp; Admissions Registry.
              </Text>
              <Text style={{ fontSize: 8, fontFamily: "Courier-Bold", color: PINE }}>
                IT SKILLCORE · PAKISTAN
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
