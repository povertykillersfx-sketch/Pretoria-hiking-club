import { buttonClasses } from "@/components/ui/button";
import { site } from "@/lib/site";

export function PaymentInstructions({
  reference,
  showEft = true,
}: {
  reference?: string;
  showEft?: boolean;
}) {
  return (
    <div className="space-y-4">
      <a
        href={site.payLink}
        target="_blank"
        rel="noreferrer noopener"
        className={buttonClasses("primary", "md", "w-full")}
      >
        Pay with Yoco
      </a>
      <p className="text-sm text-forest-900/70">
        Pay the event total on Yoco
        {reference ? (
          <>
            {" "}
            and use <strong className="text-forest-900">{reference}</strong> as
            the payment reference.
          </>
        ) : (
          ". You will get a booking reference after you confirm."
        )}
      </p>
      {showEft ? (
        <div className="rounded-3xl bg-sand/70 p-5 text-sm text-forest-900/80">
          <p className="font-display text-base font-bold tracking-tight text-forest-900">
            Or pay by EFT
          </p>
          <p className="mt-2 leading-relaxed">
            {site.bank.accountName}
            <br />
            {site.bank.bank}
            <br />
            Account {site.bank.accountNumber}
            <br />
            Branch code {site.bank.branchCode}
            {reference ? (
              <>
                <br />
                <strong>Reference: {reference}</strong>
              </>
            ) : (
              <>
                <br />
                Use your booking reference once you confirm.
              </>
            )}
          </p>
        </div>
      ) : null}
    </div>
  );
}
