---
name: update
description: 檢查紫微斗數插件有冇新版本，有就問用家要唔要更新，同意之後先經 AI 工具（Claude Code 或者 Codex）嘅插件市集更新。
disable-model-invocation: true
---

# 檢查同更新紫微斗數插件

用用家嘅語言（廣東話或者台灣華語）回覆，句子完整、唔用內部用語。插件唔會改自己嘅檔案；更新一律經用家用緊嗰個 AI 工具嘅插件市集。

1. 呼叫工具 `ziwei_check_update`（唔使任何參數）。結果嘅 `host` 係而家用緊嘅 AI 工具：`claude-code`、`codex`，或者 `unknown`（分唔到，就兩種步驟都講）。
2. 按 `status` 回覆：
   - `no-source`：直接講「呢個版本未設定發佈位置，所以暫時未可以檢查有冇新版本」，同埋而家嘅版本號（`current`）。唔好講「已經係最新版本」或者「唔使更新」，因為冇檢查過。
   - `off`：用家已經關閉自動連線檢查（`ZIWEI_NO_UPDATE_CHECK`，或者 Claude Code 設定咗減少非必要連線）；講明可以照下面第 3 點自己更新。
   - `error`：暫時連接唔到發佈位置；請用家稍後再試，或者照下面第 3 點自己更新。
   - `ok` 而 `newer` 係 `false`：已經係最新版本（講出版本號）。
   - `ok` 而 `newer` 係 `true`：講出而家版本（`current`）同新版本（`latest`），問用家要唔要更新。用家未明確答應之前唔好更新。
3. 用家答應更新之後，按 `host` 講步驟：
   - **Claude Code**：請佢輸入 `/plugin`，喺「Installed」分頁揀呢個插件，再按「Update now」；完成之後輸入 `/reload-plugins` 令新版本生效。想自動收到新版本，可以喺 `/plugin` 嘅「Marketplaces」分頁為呢個插件嘅市集開啟自動更新（第三方市集預設關閉）。
   - **Codex**：請佢喺終端機執行 `codex plugin list`，搵 `tinfu@<市集名>` 嗰行睇市集名；再執行 `codex plugin marketplace upgrade <市集名>`，跟住 `codex plugin add tinfu@<市集名>`；完成之後開一個新嘅 Codex 工作階段，新版本先會生效。呢啲指令會改 Codex 嘅設定，由用家自己執行；佢明確叫你代佢執行先可以做。
4. 唔好下載、改動或者刪除插件資料夾入面嘅檔案，亦唔好印出環境變數。
