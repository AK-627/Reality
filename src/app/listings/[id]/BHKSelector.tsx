"use client";

import { useEffect, useMemo, useState } from "react";
import type { BlueprintVariant } from "@/lib/types";

interface BHKSelectorProps {
  bhkOptions: string[];
  blueprintUrl?: string;
  blueprintVariants?: BlueprintVariant[];
}

function displayVariantLabel(variant: BlueprintVariant): string {
  const parts: string[] = [];
  if (variant.layoutName) parts.push(variant.layoutName);
  if (variant.area != null && Number.isFinite(variant.area)) {
    parts.push(`${variant.area} ${variant.areaUnit ?? "sqft"}`);
  }
  return parts.join(" | ") || "Layout";
}

export default function BHKSelector({
  bhkOptions,
  blueprintUrl,
  blueprintVariants = [],
}: BHKSelectorProps) {
  const normalizedVariants = useMemo<BlueprintVariant[]>(() => {
    const valid = blueprintVariants.filter((v) => Boolean(v?.imageUrl));
    if (valid.length > 0) return valid;
    if (!blueprintUrl) return [];

    const bhks = bhkOptions.length > 0 ? bhkOptions : [""];
    return bhks.map((bhk, idx) => ({
      id: `legacy_${idx + 1}`,
      bhk: bhk || undefined,
      layoutName: undefined,
      area: undefined,
      areaUnit: undefined,
      imageUrl: blueprintUrl,
    }));
  }, [blueprintVariants, blueprintUrl, bhkOptions]);

  const bhkTabs = useMemo(() => {
    const fromVariants = Array.from(
      new Set(
        normalizedVariants
          .map((v) => (v.bhk ?? "").trim())
          .filter(Boolean)
      )
    );
    const fromOptions = bhkOptions.map((v) => v.trim()).filter(Boolean);
    return Array.from(new Set([...fromOptions, ...fromVariants]));
  }, [normalizedVariants, bhkOptions]);

  const [selectedBhk, setSelectedBhk] = useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");

  useEffect(() => {
    if (!selectedBhk) {
      setSelectedBhk(bhkTabs[0] ?? "");
    } else if (bhkTabs.length > 0 && !bhkTabs.includes(selectedBhk)) {
      setSelectedBhk(bhkTabs[0]);
    }
  }, [bhkTabs, selectedBhk]);

  const variantsForBhk = useMemo(() => {
    if (!selectedBhk) return normalizedVariants;
    const filtered = normalizedVariants.filter((v) => (v.bhk ?? "").trim() === selectedBhk);
    return filtered.length > 0 ? filtered : normalizedVariants;
  }, [normalizedVariants, selectedBhk]);

  useEffect(() => {
    if (variantsForBhk.length === 0) {
      setSelectedVariantId("");
      return;
    }
    if (!variantsForBhk.some((v) => v.id === selectedVariantId)) {
      setSelectedVariantId(variantsForBhk[0].id);
    }
  }, [variantsForBhk, selectedVariantId]);

  const activeVariant =
    variantsForBhk.find((v) => v.id === selectedVariantId) ?? variantsForBhk[0] ?? null;

  if (normalizedVariants.length === 0 && bhkTabs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {bhkTabs.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {bhkTabs.map((bhk) => (
            <button
              key={bhk}
              type="button"
              onClick={() => setSelectedBhk(bhk)}
              className={`px-5 py-2 rounded-full text-lg font-bold border-2 transition-all duration-200 shadow-md ${
                selectedBhk === bhk
                  ? "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white border-transparent scale-110"
                  : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
              }`}
              style={{ letterSpacing: "1px" }}
            >
              {bhk}
            </button>
          ))}
        </div>
      )}

      {variantsForBhk.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {variantsForBhk.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedVariantId(variant.id)}
              className={`px-3 py-1.5 rounded border text-sm ${
                selectedVariantId === variant.id
                  ? "bg-black text-white border-black"
                  : "bg-white text-grey-700 border-grey-300 hover:border-black"
              }`}
            >
              {displayVariantLabel(variant)}
            </button>
          ))}
        </div>
      )}

      {activeVariant && (
        <div className="space-y-2">
          {(activeVariant.layoutName || activeVariant.area != null) && (
            <p className="text-sm text-grey-700">
              {[
                activeVariant.layoutName,
                activeVariant.area != null
                  ? `${activeVariant.area} ${activeVariant.areaUnit ?? "sqft"}`
                  : null,
              ]
                .filter(Boolean)
                .join(" | ")}
            </p>
          )}
          <div className="flex justify-center">
            <img
              src={activeVariant.imageUrl}
              alt={selectedBhk ? `Blueprint for ${selectedBhk}` : "Property blueprint"}
              className="w-full max-w-4xl max-h-[70vh] object-contain rounded-lg border-4 border-blue-200 shadow-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
