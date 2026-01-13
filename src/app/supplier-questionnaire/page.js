"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SupplierDueDiligenceFormPage() {
  const [form, setForm] = useState({
    supplierDetails: {
      inchargeNameAndCompany: "",
      contactDetails: "",
      companyRegistrationDetails: "",
      parentCompanyDetails: "",
      hasSubsidiaries: null,
      subsidiariesDetails: "",
      employeeCount: "",
      businessActivities: "",
      operatingLocations: "",
      paymentTerms: "30 days",
      paymentTermsOther: "",
    },
    legalDeclarations: {
      missingLicenses: null,
      criminalOffenceHistory: null,
      insolvencyStatus: null,
      businessMisconduct: null,
      unpaidStatutoryPayments: null,
      declarationDetails: "",
    },
    insuranceDetails: {
      pAndI: "",
      workersCompensation: "",
      publicLiability: "",
      otherInsurance: "",
    },
    complianceDetails: {
      qualityManagementSystem: {
        registered: null,
        dateAccredited: "",
        accreditedBy: "",
      },
      environmentalPolicy: null,
      esgProgramme: null,
      otherCertifications: "",
      isoCertification: "",
      drugAlcoholPolicy: null,
      drugAlcoholProcedure: "",
      healthSafetyPolicy: null,
      incidentsLastTwoYears: null,
      incidentDetails: "",
    },
    ethicsAndGovernance: {
      ethicalConductPolicy: null,
      equalityDiversityPolicy: null,
      subcontracting: null,
      subcontractingDetails: "",
      dueDiligenceForSubcontractors: null,
      antiCorruptionAcknowledged: null,
      modernSlaveryAcknowledged: null,
      sanctionsExposure: null,
    },
    financialAndData: {
      creditRatingDetails: "",
      turnoverLastTwoYears: "",
      dataProtectionPolicy: null,
      bankerDetails: {
        name: "",
        branch: "",
        contactDetails: "",
        ibanOrAccountNumber: "",
      },
    },
    generalDeclaration: {
      name: "",
      positionHeld: "",
      signedAt: "",
      signature: "",
    },
    purchasingDeclaration: {
      name: "",
      positionHeld: "",
      signedAt: "",
      signature: "",
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formCode, setFormCode] = useState("");
  const [version, setVersion] = useState("");

  // Function to generate form code
  const handleCreate = async () => {
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL is missing. Please set it in .env");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/qhse/due-diligence/due-diligence-questionnaire/code`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await res.json() : await res.text();

      if (!res.ok) {
        const message =
          (isJson && data?.error) ||
          (typeof data === "string" && data.slice(0, 120)) ||
          "Failed to generate form code";
        throw new Error(message);
      }

      if (!isJson) {
        throw new Error("Received non-JSON response. Check API URL or server.");
      }

      if (!data.formCode && !data.code) {
        throw new Error("API did not return formCode");
      }

      setFormCode(data.formCode || data.code || "");
      setVersion(data.version || "1.0");
    } catch (err) {
      setError(err.message || "Failed to generate form code. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  // Auto-generate code on first render so the form is immediately available
  useEffect(() => {
    handleCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (path, value) => {
    const keys = path.split(".");
    setForm((prev) => {
      const newForm = { ...prev };
      let current = newForm;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newForm;
    });
  };

  const handleSubmit = async () => {
    if (!formCode || !version) {
      setError("Form code missing. Please refresh to regenerate and try again.");
      return;
    }

    if (
      !form.supplierDetails.inchargeNameAndCompany ||
      !form.supplierDetails.contactDetails
    ) {
      setError("Please fill in required fields (Q1 and Q2)");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL is missing. Please set it in .env");
      }

      const payload = {
        ...form,
        formCode,
        version,
        supplierDetails: {
          ...form.supplierDetails,
          paymentTerms:
            form.supplierDetails.paymentTerms === "Other"
              ? form.supplierDetails.paymentTermsOther
              : form.supplierDetails.paymentTerms,
        },
        complianceDetails: {
          ...form.complianceDetails,
          qualityManagementSystem: {
            ...form.complianceDetails.qualityManagementSystem,
            dateAccredited: form.complianceDetails.qualityManagementSystem
              .dateAccredited
              ? new Date(
                  form.complianceDetails.qualityManagementSystem.dateAccredited
                )
              : undefined,
          },
        },
        generalDeclaration: {
          ...form.generalDeclaration,
          signedAt: form.generalDeclaration.signedAt
            ? new Date(form.generalDeclaration.signedAt)
            : undefined,
        },
        purchasingDeclaration: {
          ...form.purchasingDeclaration,
          signedAt: form.purchasingDeclaration.signedAt
            ? new Date(form.purchasingDeclaration.signedAt)
            : undefined,
        },
      };

      // Submit to external backend
      // TODO: Replace with your external backend API URL
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/qhse/due-diligence/due-diligence-questionnaire/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await res.json() : await res.text();

      if (!res.ok) {
        const message =
          (isJson && data?.error) ||
          (typeof data === "string" && data.slice(0, 120)) ||
          "Failed to submit form";
        throw new Error(message);
      }

      if (!isJson) {
        throw new Error("Received non-JSON response. Check API URL or server.");
      }

      // Show prominent success message
      setSuccess("✅ Form submitted successfully!");
      setError("");

      // Reset form
      setForm({
        supplierDetails: {
          inchargeNameAndCompany: "",
          contactDetails: "",
          companyRegistrationDetails: "",
          parentCompanyDetails: "",
          hasSubsidiaries: null,
          subsidiariesDetails: "",
          employeeCount: "",
          businessActivities: "",
          operatingLocations: "",
          paymentTerms: "30 days",
          paymentTermsOther: "",
        },
        legalDeclarations: {
          missingLicenses: null,
          criminalOffenceHistory: null,
          insolvencyStatus: null,
          businessMisconduct: null,
          unpaidStatutoryPayments: null,
          declarationDetails: "",
        },
        insuranceDetails: {
          pAndI: "",
          workersCompensation: "",
          publicLiability: "",
          otherInsurance: "",
        },
        complianceDetails: {
          qualityManagementSystem: {
            registered: null,
            dateAccredited: "",
            accreditedBy: "",
          },
          environmentalPolicy: null,
          esgProgramme: null,
          otherCertifications: "",
          isoCertification: "",
          drugAlcoholPolicy: null,
          drugAlcoholProcedure: "",
          healthSafetyPolicy: null,
          incidentsLastTwoYears: null,
          incidentDetails: "",
        },
        ethicsAndGovernance: {
          ethicalConductPolicy: null,
          equalityDiversityPolicy: null,
          subcontracting: null,
          subcontractingDetails: "",
          dueDiligenceForSubcontractors: null,
          antiCorruptionAcknowledged: null,
          modernSlaveryAcknowledged: null,
          sanctionsExposure: null,
        },
        financialAndData: {
          creditRatingDetails: "",
          turnoverLastTwoYears: "",
          dataProtectionPolicy: null,
          bankerDetails: {
            name: "",
            branch: "",
            contactDetails: "",
            ibanOrAccountNumber: "",
          },
        },
        generalDeclaration: {
          name: "",
          positionHeld: "",
          signedAt: "",
          signature: "",
        },
        purchasingDeclaration: {
          name: "",
          positionHeld: "",
          signedAt: "",
          signature: "",
        },
      });

      // Reset form creation state
      setFormCode("");
      setVersion("");
      setIsFormCreated(false);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSuccess("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 ml-72 mr-6">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <header className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/qhse"
              className="flex h-10 w-10 items-center cursor-pointer justify-center rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition"
            >
              <span className="text-lg">←</span>
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-sky-300">
                QHSE / Due Diligence / Supplier Due Diligence Questionnaire
              </p>
              <h1 className="text-2xl font-bold">
                Supplier Due Diligence Questionnaire
                {formCode && (
                  <span className="text-sm text-slate-400 ml-2">
                    (Code: {formCode})
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-200 mt-1">
                The form code is generated automatically on load. If it fails,
                refresh the page and try again.
              </p>
            </div>
          </div>
          <Link
            href="/qhse/due-diligence-subconstructor/due-diligence-questionnaire/questionnaire-list-user"
            className="ml-auto rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 transition"
          >
            My Forms
          </Link>
        </header>

        {error && (
          <div className="text-sm text-red-300 bg-red-950/40 border border-red-500/40 rounded-lg px-4 py-3 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="text-base text-emerald-300 bg-emerald-950/40 border-2 border-emerald-500/60 rounded-lg px-6 py-4 flex items-center gap-3 shadow-lg shadow-emerald-500/20">
            <span className="text-2xl">✅</span>
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {creating && !formCode && (
          <div className="text-sm text-slate-200 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
            Generating form code...
          </div>
        )}

        <form className="rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md shadow-2xl p-6 space-y-8">
            {/* Section 1: Basic Details (Q1-Q9) */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Basic Details
              </h2>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    1. Name of the person Incharge and company providing product
                    or service <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.supplierDetails.inchargeNameAndCompany}
                    onChange={(e) =>
                      handleChange(
                        "supplierDetails.inchargeNameAndCompany",
                        e.target.value
                      )
                    }
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    2. Full style contact details{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.supplierDetails.contactDetails}
                    onChange={(e) =>
                      handleChange(
                        "supplierDetails.contactDetails",
                        e.target.value
                      )
                    }
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    3. Company Registration Detail
                  </label>
                  <input
                    type="text"
                    value={form.supplierDetails.companyRegistrationDetails}
                    onChange={(e) =>
                      handleChange(
                        "supplierDetails.companyRegistrationDetails",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Please send a copy of trade license.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    4. Name of parent company (s) (if applicable): Registration
                    number of parent company (if applicable):
                  </label>
                  <input
                    type="text"
                    value={form.supplierDetails.parentCompanyDetails}
                    onChange={(e) =>
                      handleChange(
                        "supplierDetails.parentCompanyDetails",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    5. Does the organisation have any subsidiaries? If yes, then
                    please state the name of the organisation(s):
                  </label>
                  <div className="flex items-center gap-4 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasSubsidiaries"
                        checked={form.supplierDetails.hasSubsidiaries === true}
                        onChange={() =>
                          handleChange("supplierDetails.hasSubsidiaries", true)
                        }
                        className="h-4 w-4 text-sky-500"
                      />
                      <span className="text-sm text-white">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasSubsidiaries"
                        checked={form.supplierDetails.hasSubsidiaries === false}
                        onChange={() =>
                          handleChange("supplierDetails.hasSubsidiaries", false)
                        }
                        className="h-4 w-4 text-sky-500"
                      />
                      <span className="text-sm text-white">No</span>
                    </label>
                  </div>
                  {form.supplierDetails.hasSubsidiaries === true && (
                    <input
                      type="text"
                      value={form.supplierDetails.subsidiariesDetails}
                      onChange={(e) =>
                        handleChange(
                          "supplierDetails.subsidiariesDetails",
                          e.target.value
                        )
                      }
                      placeholder="Enter subsidiary names"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    6. How many employees does your organisation employ?
                  </label>
                  <input
                    type="number"
                    value={form.supplierDetails.employeeCount}
                    onChange={(e) =>
                      handleChange(
                        "supplierDetails.employeeCount",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    7. Kindly mention the business activities the organization
                    involved in:
                  </label>
                  <textarea
                    rows={3}
                    value={form.supplierDetails.businessActivities}
                    onChange={(e) =>
                      handleChange(
                        "supplierDetails.businessActivities",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    8. Kindly mention the locations of operation, distribution,
                    and logistics:
                  </label>
                  <textarea
                    rows={3}
                    value={form.supplierDetails.operatingLocations}
                    onChange={(e) =>
                      handleChange(
                        "supplierDetails.operatingLocations",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    9. Please advise payment terms that can be offered:
                  </label>
                  <div className="flex items-center gap-4 mb-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleChange("supplierDetails.paymentTerms", "30 days")
                      }
                      className={`px-4 py-2 rounded-lg border text-sm transition ${
                        form.supplierDetails.paymentTerms === "30 days"
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                      }`}
                    >
                      30 days
                    </button>
                    <span className="text-sm text-white">Others:</span>
                    <input
                      type="text"
                      value={form.supplierDetails.paymentTermsOther}
                      onChange={(e) =>
                        handleChange(
                          "supplierDetails.paymentTermsOther",
                          e.target.value
                        )
                      }
                      onFocus={() =>
                        handleChange("supplierDetails.paymentTerms", "Other")
                      }
                      placeholder="Enter other payment terms"
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Legal Declarations (Q10-Q15) */}
            <div className="space-y-6 border-t border-white/10 pt-6">
              <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Legal & Financial Declarations
              </h2>
              <p className="text-sm text-white font-medium">
                Kindly answer if any of the below applicable to your
                organization or any Director(s) or Partner(s).
              </p>

              <div className="space-y-4">
                {[
                  {
                    key: "missingLicenses",
                    label:
                      "10. Does not possess necessary licenses or memberships in appropriate as required by law?",
                  },
                  {
                    key: "criminalOffenceHistory",
                    label:
                      "11. Has been found guilty of a criminal offence related to business or professional affair?",
                  },
                  {
                    key: "insolvencyStatus",
                    label:
                      "12. Do you currently face bankruptcy, insolvency, compulsory winding up, or similar proceedings?",
                  },
                  {
                    key: "businessMisconduct",
                    label: "13. Committed a grave business misconduct?",
                  },
                  {
                    key: "unpaidStatutoryPayments",
                    label:
                      "14. Taxes and other statutory payments have not been paid?",
                  },
                ].map((q) => (
                  <div key={q.key} className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 block">
                      {q.label}
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.key}
                          checked={form.legalDeclarations[q.key] === true}
                          onChange={() =>
                            handleChange(`legalDeclarations.${q.key}`, true)
                          }
                          className="h-4 w-4 text-sky-500"
                        />
                        <span className="text-sm text-white">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.key}
                          checked={form.legalDeclarations[q.key] === false}
                          onChange={() =>
                            handleChange(`legalDeclarations.${q.key}`, false)
                          }
                          className="h-4 w-4 text-sky-500"
                        />
                        <span className="text-sm text-white">No</span>
                      </label>
                    </div>
                  </div>
                ))}

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    15. If the answer to any of these is 'Yes' please give brief
                    details below, including what has been done to put things
                    right:
                  </label>
                  <textarea
                    rows={4}
                    value={form.legalDeclarations.declarationDetails}
                    onChange={(e) =>
                      handleChange(
                        "legalDeclarations.declarationDetails",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Insurance Details (Q16-Q19) */}
            <div className="space-y-6 border-t border-white/10 pt-6">
              <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Insurance Details
              </h2>
              <p className="text-sm text-white font-medium">
                Please provide details of your current insurance cover
              </p>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    16. P & I (Protection & Indemnity):
                  </label>
                  <input
                    type="text"
                    value={form.insuranceDetails.pAndI}
                    onChange={(e) =>
                      handleChange("insuranceDetails.pAndI", e.target.value)
                    }
                    placeholder="Value"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    17. Workmen's Compensation / Employers' Liability (or
                    equivalent):
                  </label>
                  <input
                    type="text"
                    value={form.insuranceDetails.workersCompensation}
                    onChange={(e) =>
                      handleChange(
                        "insuranceDetails.workersCompensation",
                        e.target.value
                      )
                    }
                    placeholder="Value"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    18. Liability for public and third parties:
                  </label>
                  <input
                    type="text"
                    value={form.insuranceDetails.publicLiability}
                    onChange={(e) =>
                      handleChange(
                        "insuranceDetails.publicLiability",
                        e.target.value
                      )
                    }
                    placeholder="Value"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    19. Other (please provide details):
                  </label>
                  <input
                    type="text"
                    value={form.insuranceDetails.otherInsurance}
                    onChange={(e) =>
                      handleChange(
                        "insuranceDetails.otherInsurance",
                        e.target.value
                      )
                    }
                    placeholder="Value"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Quality & Compliance (Q20-Q28) */}
            <div className="space-y-6 border-t border-white/10 pt-6">
              <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Quality & Compliance
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    20. Is your company registered with a recognised quality
                    management system? Please share details.
                  </label>
                  <div className="flex items-center gap-4 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="qualityManagementSystem"
                        checked={
                          form.complianceDetails.qualityManagementSystem
                            .registered === true
                        }
                        onChange={() =>
                          handleChange(
                            "complianceDetails.qualityManagementSystem.registered",
                            true
                          )
                        }
                        className="h-4 w-4 text-sky-500"
                      />
                      <span className="text-sm text-white">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="qualityManagementSystem"
                        checked={
                          form.complianceDetails.qualityManagementSystem
                            .registered === false
                        }
                        onChange={() =>
                          handleChange(
                            "complianceDetails.qualityManagementSystem.registered",
                            false
                          )
                        }
                        className="h-4 w-4 text-sky-500"
                      />
                      <span className="text-sm text-white">No</span>
                    </label>
                  </div>
                  {form.complianceDetails.qualityManagementSystem.registered ===
                    true && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          Date Accredited:
                        </label>
                        <input
                          type="date"
                          value={
                            form.complianceDetails.qualityManagementSystem
                              .dateAccredited
                          }
                          onChange={(e) =>
                            handleChange(
                              "complianceDetails.qualityManagementSystem.dateAccredited",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          Accredited by:
                        </label>
                        <input
                          type="text"
                          value={
                            form.complianceDetails.qualityManagementSystem
                              .accreditedBy
                          }
                          onChange={(e) =>
                            handleChange(
                              "complianceDetails.qualityManagementSystem.accreditedBy",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {[
                  {
                    key: "environmentalPolicy",
                    label:
                      "21. Is there a written policy for environmental and sustainability in your organization? If yes, please provide a copy",
                  },
                  {
                    key: "esgProgramme",
                    label:
                      "22. Does your company have an Environmental, Social and Governance Programme?",
                  },
                  {
                    key: "drugAlcoholPolicy",
                    label:
                      "25. Is there a drug and alcohol policy in your organization?",
                  },
                  {
                    key: "healthSafetyPolicy",
                    label:
                      "27. Is there a written Health and Safety at Work Policy in your organization?",
                  },
                  {
                    key: "incidentsLastTwoYears",
                    label:
                      "28. In the past two years, has the company experienced any incident relating to health and safety?",
                  },
                ].map((q) => (
                  <div key={q.key} className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 block">
                      {q.label}
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.key}
                          checked={form.complianceDetails[q.key] === true}
                          onChange={() =>
                            handleChange(`complianceDetails.${q.key}`, true)
                          }
                          className="h-4 w-4 text-sky-500"
                        />
                        <span className="text-sm text-white">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.key}
                          checked={form.complianceDetails[q.key] === false}
                          onChange={() =>
                            handleChange(`complianceDetails.${q.key}`, false)
                          }
                          className="h-4 w-4 text-sky-500"
                        />
                        <span className="text-sm text-white">No</span>
                      </label>
                    </div>
                  </div>
                ))}

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    23. Is there any other industry-recognized certification you
                    hold? If so, please share details:
                  </label>
                  <textarea
                    rows={3}
                    value={form.complianceDetails.otherCertifications}
                    onChange={(e) =>
                      handleChange(
                        "complianceDetails.otherCertifications",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    24. Does your company hold a valid ISO 9001, 14001, 45001
                    certificate or equivalent?
                  </label>
                  <input
                    type="text"
                    value={form.complianceDetails.isoCertification}
                    onChange={(e) =>
                      handleChange(
                        "complianceDetails.isoCertification",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {form.complianceDetails.drugAlcoholPolicy === false && (
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-slate-400 block">
                      26. If no, please advise the procedure you adopt in case
                      of alcohol and drug abuse by your employees.
                    </label>
                    <textarea
                      rows={3}
                      value={form.complianceDetails.drugAlcoholProcedure}
                      onChange={(e) =>
                        handleChange(
                          "complianceDetails.drugAlcoholProcedure",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
                    />
                  </div>
                )}

                {form.complianceDetails.incidentsLastTwoYears === true && (
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-slate-400 block">
                      29. If 'Yes' to the above, please provide details:
                    </label>
                    <textarea
                      rows={4}
                      value={form.complianceDetails.incidentDetails}
                      onChange={(e) =>
                        handleChange(
                          "complianceDetails.incidentDetails",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 5: Ethics & Governance (Q30-Q37) */}
            <div className="space-y-6 border-t border-white/10 pt-6">
              <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Ethics & Governance
              </h2>

              <div className="space-y-4">
                {[
                  {
                    key: "ethicalConductPolicy",
                    label:
                      "30. Is your company in possession of an Ethical Conduct Policy?",
                  },
                  {
                    key: "equalityDiversityPolicy",
                    label:
                      "31. Is there a written Equality, Diversity and Inclusion Policy in your company, so that discrimination can be avoided, and equal opportunities to be given to all employees, wherever possible?",
                  },
                  {
                    key: "subcontracting",
                    label:
                      "32. If any aspect of the services provided to the company is subcontracted to any third party.",
                  },
                  {
                    key: "dueDiligenceForSubcontractors",
                    label:
                      "34. The company must ensure that due diligence has been completed for the subcontractors and they must company with company's policies and procedures.",
                  },
                  {
                    key: "antiCorruptionAcknowledged",
                    label:
                      "35. Please ensure that you have read and understood the Anti-Corruption and Bribery Policy and you will comply with (Policy attached).",
                  },
                  {
                    key: "modernSlaveryAcknowledged",
                    label:
                      "36. Please ensure that you have read and understood our policy on Modern Slavery, and you will comply with (Policy attached).",
                  },
                  {
                    key: "sanctionsExposure",
                    label:
                      "37. Is your organization subject to any active sanctions issued by EU, UN, UK, OFAC or UAE Federal Law.",
                  },
                ].map((q) => (
                  <div key={q.key} className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 block">
                      {q.label}
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.key}
                          checked={form.ethicsAndGovernance[q.key] === true}
                          onChange={() =>
                            handleChange(`ethicsAndGovernance.${q.key}`, true)
                          }
                          className="h-4 w-4 text-sky-500"
                        />
                        <span className="text-sm text-white">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.key}
                          checked={form.ethicsAndGovernance[q.key] === false}
                          onChange={() =>
                            handleChange(`ethicsAndGovernance.${q.key}`, false)
                          }
                          className="h-4 w-4 text-sky-500"
                        />
                        <span className="text-sm text-white">No</span>
                      </label>
                    </div>
                  </div>
                ))}

                {form.ethicsAndGovernance.subcontracting === true && (
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-slate-400 block">
                      33. If 'Yes', please provide details.
                    </label>
                    <textarea
                      rows={3}
                      value={form.ethicsAndGovernance.subcontractingDetails}
                      onChange={(e) =>
                        handleChange(
                          "ethicsAndGovernance.subcontractingDetails",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 6: Financial & Data Protection (Q38-Q41) */}
            <div className="space-y-6 border-t border-white/10 pt-6">
              <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Financial & Data Protection
              </h2>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    38. What is your current credit rating and name of credit
                    rating agency?
                  </label>
                  <input
                    type="text"
                    value={form.financialAndData.creditRatingDetails}
                    onChange={(e) =>
                      handleChange(
                        "financialAndData.creditRatingDetails",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    39. What was your turnover in the last two years:
                  </label>
                  <input
                    type="text"
                    value={form.financialAndData.turnoverLastTwoYears}
                    onChange={(e) =>
                      handleChange(
                        "financialAndData.turnoverLastTwoYears",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    40. *Do you have General Data Protection Policy in written,
                    please provide a copy.
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dataProtectionPolicy"
                        checked={
                          form.financialAndData.dataProtectionPolicy === true
                        }
                        onChange={() =>
                          handleChange(
                            "financialAndData.dataProtectionPolicy",
                            true
                          )
                        }
                        className="h-4 w-4 text-sky-500"
                      />
                      <span className="text-sm text-white">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dataProtectionPolicy"
                        checked={
                          form.financialAndData.dataProtectionPolicy === false
                        }
                        onChange={() =>
                          handleChange(
                            "financialAndData.dataProtectionPolicy",
                            false
                          )
                        }
                        className="h-4 w-4 text-sky-500"
                      />
                      <span className="text-sm text-white">No</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 block">
                    41. What is the name and branch of your bankers (who could
                    provide a reference)?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Name:
                      </label>
                      <input
                        type="text"
                        value={form.financialAndData.bankerDetails.name}
                        onChange={(e) =>
                          handleChange(
                            "financialAndData.bankerDetails.name",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Branch:
                      </label>
                      <input
                        type="text"
                        value={form.financialAndData.bankerDetails.branch}
                        onChange={(e) =>
                          handleChange(
                            "financialAndData.bankerDetails.branch",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Contact details:
                      </label>
                      <input
                        type="text"
                        value={
                          form.financialAndData.bankerDetails.contactDetails
                        }
                        onChange={(e) =>
                          handleChange(
                            "financialAndData.bankerDetails.contactDetails",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        IBAN and/or account number:
                      </label>
                      <input
                        type="text"
                        value={
                          form.financialAndData.bankerDetails
                            .ibanOrAccountNumber
                        }
                        onChange={(e) =>
                          handleChange(
                            "financialAndData.bankerDetails.ibanOrAccountNumber",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 7: Declarations */}
            <div className="space-y-6 border-t border-white/10 pt-6">
              <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Declarations
              </h2>

              {/* General Declaration */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
                <h3 className="text-base font-semibold text-orange-400">
                  General Declaration
                </h3>
                <p className="text-sm text-slate-200">
                  I declare that the information as requested by our client has
                  been provided and it is true to the best of my knowledge. I
                  understand that the evaluation process, to gauze the
                  suitability of my organization to be invited for the tenders
                  as announced by our client, will be based on the information
                  as provided in this questionnaire. I affirm that my
                  organisation complies to all applicable local, international
                  and industry regulations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Name:
                    </label>
                    <input
                      type="text"
                      value={form.generalDeclaration.name}
                      onChange={(e) =>
                        handleChange("generalDeclaration.name", e.target.value)
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Position Held:
                    </label>
                    <input
                      type="text"
                      value={form.generalDeclaration.positionHeld}
                      onChange={(e) =>
                        handleChange(
                          "generalDeclaration.positionHeld",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Signature:
                    </label>
                    <textarea
                      rows={2}
                      value={form.generalDeclaration.signature}
                      onChange={(e) =>
                        handleChange(
                          "generalDeclaration.signature",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Date (dd/mm/yyyy):
                    </label>
                    <input
                      type="date"
                      value={form.generalDeclaration.signedAt}
                      onChange={(e) =>
                        handleChange(
                          "generalDeclaration.signedAt",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Purchasing Declaration */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
                <h3 className="text-base font-semibold text-orange-400">
                  Purchasing Terms & Conditions Declaration
                </h3>
                <p className="text-sm text-slate-200">
                  We declare that we have read and understood the company's
                  purchasing terms and condition and we affirm that the company
                  will comply with all the provisions mentioned therein and it
                  will not constitute any breach of a policy, local applicable
                  laws, and regulations thereupon.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Name:
                    </label>
                    <input
                      type="text"
                      value={form.purchasingDeclaration.name}
                      onChange={(e) =>
                        handleChange(
                          "purchasingDeclaration.name",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Position Held:
                    </label>
                    <input
                      type="text"
                      value={form.purchasingDeclaration.positionHeld}
                      onChange={(e) =>
                        handleChange(
                          "purchasingDeclaration.positionHeld",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Signature:
                    </label>
                    <textarea
                      rows={2}
                      value={form.purchasingDeclaration.signature}
                      onChange={(e) =>
                        handleChange(
                          "purchasingDeclaration.signature",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Date (dd/mm/yyyy):
                    </label>
                    <input
                      type="date"
                      value={form.purchasingDeclaration.signedAt}
                      onChange={(e) =>
                        handleChange(
                          "purchasingDeclaration.signedAt",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <div className="flex items-center gap-4">
                {formCode ? (
                  <div className="text-xs text-slate-400">
                    Form Code:{" "}
                    <span className="text-white font-semibold">{formCode}</span>{" "}
                    | Version:{" "}
                    <span className="text-white font-semibold">{version}</span>
                  </div>
                ) : (
                  <div className="text-xs text-red-300">
                    Form code missing. Please refresh and try again.
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !formCode}
                className="px-6 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold uppercase tracking-wider transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30"
              >
                {submitting ? "Submitting..." : "Submit Form"}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}
