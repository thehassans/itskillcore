import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import Course from "@/models/Course";
import CouponManager from "@/components/admin/CouponManager";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await connectDB();
  const [coupons, courses]: any[] = await Promise.all([
    Coupon.find().populate("applicableCourse", "title").sort({ createdAt: -1 }).lean(),
    Course.find().select("title").lean(),
  ]).then(plain);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="h-display text-2xl text-slate-900">Coupons &amp; Scholarship Codes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create promo discounts and tuition waiver codes applied automatically to enrollment fees and monthly installments.
        </p>
      </div>
      <CouponManager initialCoupons={coupons} courses={courses} />
    </div>
  );
}
