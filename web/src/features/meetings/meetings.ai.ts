// web/src/features/meetings/meetings.ai.ts
// Meeting Copilot stub. Backend yok — istemci tarafında yapılandırılmış bir
// not özeti taslağı üretir. Gerçek LLM bağlandığında yalnızca `run` gövdesi
// değişir; prompt sözleşmesi (`meetings.ai.notes` + `activeTitle`) sabit kalır.
import * as React from "react";
import { useTranslation } from "react-i18next";
import { meetingStore } from "./meetings.store";

/** Copilot prompt kimlikleri — i18n `meetings:ai.*` altından okunur. */
export type CopilotPromptId = "meetings.ai.notes";

export interface CopilotNoteSection {
  heading: string;
  bullets: string[];
}

export interface CopilotResult {
  promptId: CopilotPromptId;
  title: string;
  /** Tek satırlık özet (toast / başlık için). */
  summary: string;
  /** Yapılandırılmış bölümler (özet / kararlar / sonraki adımlar). */
  sections: CopilotNoteSection[];
}

const PROMPT_TO_TOAST: Record<CopilotPromptId, string> = {
  "meetings.ai.notes": "ai.notesToast",
};

/**
 * `meetings.ai.notes` promptunu çalıştıran Copilot kancası.
 * - `activeTitle` interpolasyonu ile başlık-bağlamlı bir özet üretir.
 * - Üretim bitince ilgili i18n toast'ını gösterir (stub davranışı).
 *
 * @returns `ask(promptId)` — çağrıldığında yapılandırılmış `CopilotResult` döndürür.
 */
export function useAskCopilot(
  onToast?: (message: string) => void,
): (promptId: CopilotPromptId) => CopilotResult {
  const { t } = useTranslation("meetings");

  return React.useCallback(
    (promptId: CopilotPromptId): CopilotResult => {
      const activeTitle = meetingStore.getState().activeTitle;
      // Prompt + activeTitle interpolasyonu — gerçek API bu metni LLM'e geçirir.
      const summary = t(`${promptId}.summary`, { activeTitle });
      const sections: CopilotNoteSection[] = [
        {
          heading: t(`${promptId}.section.summary`),
          bullets: [t(`${promptId}.summary`, { activeTitle })],
        },
        {
          heading: t(`${promptId}.section.decisions`),
          bullets: t(`${promptId}.decisions`, { returnObjects: true }) as unknown as string[],
        },
        {
          heading: t(`${promptId}.section.nextSteps`),
          bullets: t(`${promptId}.nextSteps`, { returnObjects: true }) as unknown as string[],
        },
      ];

      onToast?.(t(PROMPT_TO_TOAST[promptId]));

      return { promptId, title: activeTitle, summary, sections };
    },
    [t, onToast],
  );
}
