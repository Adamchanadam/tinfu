# 出生時間：收資料、對吓舊事、搵時辰（收出生資料之前讀晒）

安全規則照 SKILL.md「安全」一節，永遠優先。

## 開始收資料

- 若未有記憶：收出生日期（西曆或者農曆；農曆要問係咪閏月）、性別、出生城市，同埋出生時間，**一句過收**，缺乜先追問乜。之後一定要問清楚出生時間嘅來源，再照下面「對吓舊事」用 `ziwei_time_candidates`。
- 完全唔知出生時間：**唔好叫用家自己去搵**。用 `timeSource: "unknown"`，照下面「對吓舊事」逐條問 `ziwei_check_answers` 畀嘅 `next`，幫佢搵出最可能嘅時辰（推算）；未到 `estimate.usable` 之前唔出「你係點樣嘅人」嘅講法。記得朝早定夜晚就改用 `period`。問完仍然分唔開，照實講暫時分唔出，問佢可唔可以多講一兩件有年份嘅人生大轉變；用家同意就用 `ziwei_save_birth_without_time` 先記低出生日期，下次繼續。

## 對吓舊事（核對出生時間）

### 1. 出生時間來源 → `timeSource`

| 用家講法 | timeSource | 要傳 |
|---|---|---|
| 出世紙／出生證明寫嘅時間 | `certificate` | `clockTime` |
| 屋企人記憶、「七點左右」 | `family` | `clockTime` |
| 「大約七點至九點」 | `range` | `clockFrom`、`clockTo` |
| 只知時辰名（例如「巳時」） | `shichen` | `timeIndex`（0–12）；對唔上先加 `includeNeighbors` |
| 只知朝早、下晝、夜晚 | `period` | `period` |
| 完全唔知 | `unknown` | — |

- 喺實施過夏令時間嘅年份出世（例如香港 1941 至 1979 年、台灣部分年份），而用家唔肯定個時間有冇自己扣過：加 `dstUncertain: true`。工具會按當日當地有冇夏令時間自動判斷。
- 三個工具（`ziwei_time_candidates`、`ziwei_candidate_diff`、`ziwei_check_answers`）每次都傳**同一組出生資料**，佢哋會自己重新推算候選，唔使傳候選清單。

### 2. 睇 `estimate` 決定講幾多

- `ziwei_check_answers` 嘅 `estimate`：`usable` 係 `true` 先可以用 `estimate.top` 嗰張候選嘅 `chartArgs` 排盤。`level`：`checked` 同舊事比較夾；`lead` 明顯領先；`multi` 領先唔明顯；`open` 仲分唔開（繼續問 `next`）。除咗 `single`、`checked`，講解時一定要講明「按你嘅回答推算」，同時講出 `estimate.alternatives` 嘅其他可能時辰，唔好講成確定。
- 有其他可能時：用家問重大決定（辭職、轉工、創業、置業、投資、生育、結婚、移民），講時機只用幾個可能之間一樣嘅部分（存咗命盤之後，介面同 AI 材料會逐年比較；對話入面就講明呢方面會隨出生時辰唔同而改變），唔好單靠目前嗰個時辰下判斷。
- 用提問揀咗時辰之後存盤：`ziwei_save_chart` 用 `estimate.top` 嘅 `chartArgs`，再加 `fromCheck`（同一組出生資料同所有答案）；程式會重新對照，記低「推算／已核對」同其他可能，介面同匯出檔案就會一致。冇 `fromCheck` 直接存「幾個可能之一」（或者另一種排法），程式會拒絕；只有一個可能嘅候選、或者用家親口講嘅鐘面時間（用 `clockTime`）先可以直接存。
- `schoolAlternatives`（只喺出生時間清楚時出現）：另一種常見排法（只扣夏令時間、唔按地點校正）會排成另一個時辰。預設照用真太陽時；用家提到老師用夏令時間減一小時，或者想比較，就加 `includeSchool: true` 再照常問題比較。
- 以下 `readingMode` 係舊有嘅剔除判斷，照舊可以參考：

- `single`：可以用嗰張盤答用家問嘅範疇（用候選嘅 `chartArgs` 呼叫 `ziwei_get_natal_chart`）。工具講係推算（`provisional`）就要講明係「推算」。
- `common`：只講候選之間一樣嘅部分（`commonPalaces`，或者 `ziwei_candidate_diff` 嘅 `palaceAgreement`），講明「仲有少少唔肯定」；唔同嘅地方要先問舊事。
- `askFirst`：候選之間冇共通講法（相鄰時間通常係咁）。先問 1 至 2 條分得開嘅題目；`ziwei_check_answers` 有 `provisionalLeader` 先可以用嗰張畀「推算」答案，講明仲有另一個可能；冇就繼續問，唔好出個人解讀。
- `none`：仲有太多個可能。睇 `estimate`：未 `usable` 就繼續問 `next`，唔好出個人解讀。
- 一張候選要兩件唔同嘅事都對唔上、而且明顯落後先會被剔走；同一件事講兩次只計一次。

### 3. 問舊事

- 喺答問題途中穿插問，例如：「想講得準啲，可唔可以問你一件舊事？」唔好一次過問晒，A 級問 2 至 3 條，B、C 級成段對話大約 6 至 10 條。
- 下一條題目照 `ziwei_check_answers` 嘅 `next` 問（第一次傳 `answers: []`），次序係出生時段記憶 → 人生大事（最多五件，第二件起可以答「冇其他了」→ `done`）→ 家庭 → 二選一性格描述；題目照工具嘅 `zhHK`（廣東話）或者 `zhTW`（台灣華語）用日常語言問。`next` 係 `null` 就唔使再問。工具唔會畀預期答案，你亦唔好估、唔好引導。
- 二選一性格描述（`kind: "pick"`）：將 `choices` 兩段描述原文並列，問「邊一段比較似你」；用家揀咗就傳 `answer: "pick"`、`pick`（嗰段嘅 `pick`）同 `pair`（原樣），兩段都唔似就 `answer: "neither"`。唔好改寫描述、唔好提示星名。
- 敏感題（`needsConsent: true`，即父母、感情）：先用 `consentPrompt` 問「呢類問題可唔可以問？」；用家同意先問，之後喺 `allowSensitive` 加入。用家唔同意就唔再問同類題目。
- 未滿 18 歲嘅盤唔問舊事同家庭（工具只會出出生時段記憶同性格描述題，由家長或者本人答）。

### 4. 對照（一定由工具判）

- 用家每答一條，就用 `ziwei_check_answers` 傳**到目前為止所有答案**（按問嘅先後）。「吻合／可能吻合／對唔上／資料不足」只可以照工具結果講，唔可以自己判，亦唔可以將「嗰年好亂」當吻合。
- 用家話「唔記得」：`answer: "forgot"`，換一條；工具講連續兩條唔記得，就轉問唔使記年份嘅事，或者停止對照。
- 用家話「唔想答」：`answer: "skip"`，唔追問原因，之後喺 `skippedDomains` 加入嗰個範疇。
- 大轉變年份用 `event`：知道月份就填 `month`；只記得「九幾年」就用 `year` 加 `yearTo`；用家自己話唔肯定就加 `unsure: true`。
- 敏感題結果有 `deferMismatch`：唔好即刻講「對唔上」，留待總結先溫和講。
- 用家講流產、夭折：回一句體諒嘅說話，轉去其他題目，唔計入、唔追問。
- 分數只用嚟排先後，唔好講成機率。呢個只係「核對」，未經驗證，**唔可以話已經準確定到出生時間**。
- `advice` 有 `expandNeighbors`：講明單一時間有幾件對唔上，建議比較前後嘅時間。
