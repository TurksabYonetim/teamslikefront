import * as React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import clsx from "clsx";
import { Modal, Button } from "@/components/ui";
import { messagingStore } from "../store";
import { ME_ID } from "../members";

// Modül seviyesinde: her render'da yeni bileşen tipi üretip remount/focus kaybına
// yol açmasın diye component dışında tanımlı (saf props).
function Toggle({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => set(!on)}
      aria-pressed={on}
      className={clsx(
        "h-9 rounded-md border px-3 text-sm",
        on ? "border-brand bg-surface-2 text-brand" : "border-line text-muted dark:border-gray-700",
      )}
    >
      {label}
    </button>
  );
}

export function CreatePollDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation("messaging");
  const createPoll = messagingStore.getState().createPoll;

  const [question, setQuestion] = React.useState("");
  const [options, setOptions] = React.useState(["", ""]);
  const [multi, setMulti] = React.useState(false);
  const [anonymous, setAnonymous] = React.useState(false);
  const [quiz, setQuiz] = React.useState(false);
  const [correctIndex, setCorrectIndex] = React.useState(0);

  const valid = !!question.trim() && options.filter((o) => o.trim()).length >= 2;

  const reset = () => {
    setQuestion("");
    setOptions(["", ""]);
    setMulti(false);
    setAnonymous(false);
    setQuiz(false);
    setCorrectIndex(0);
  };

  const submit = () => {
    if (!valid) return;
    createPoll(question, options, { multi, anonymous, quiz, correctIndex }, ME_ID);
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t("poll.create")}>
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink-2">{t("poll.question")}</span>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="input h-11"
          />
        </label>

        <div className="space-y-2">
          <span className="block text-sm font-medium text-ink-2">{t("poll.option")}</span>
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              {quiz ? (
                <input
                  type="radio"
                  name="correct"
                  checked={correctIndex === i}
                  onChange={() => setCorrectIndex(i)}
                  aria-label={t("poll.quiz")}
                  className="radio h-5 w-5"
                />
              ) : null}
              <input
                value={o}
                onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))}
                className="input h-11 min-w-0 flex-1"
                placeholder={`${t("poll.option")} ${i + 1}`}
              />
              {options.length > 2 ? (
                <button
                  type="button"
                  onClick={() => setOptions(options.filter((_, j) => j !== i))}
                  aria-label={t("poll.option")}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2.5 text-muted hover:bg-surface-2 dark:hover:bg-gray-700"
                >
                  <HiOutlineTrash className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
            </div>
          ))}
          <Button variant="ghost" onClick={() => setOptions([...options, ""])}>
            <HiOutlinePlus className="h-4 w-4" aria-hidden /> {t("poll.addOption")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Toggle on={multi} set={setMulti} label={t("poll.multi")} />
          <Toggle on={anonymous} set={setAnonymous} label={t("poll.anonymous")} />
          <Toggle on={quiz} set={setQuiz} label={t("poll.quiz")} />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={submit} disabled={!valid}>
            {t("poll.send")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
