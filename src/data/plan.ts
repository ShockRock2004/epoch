// The Mess-Table ML plan: 100 episodes, two per lunch, classic ML → LLM agents.
// Video titles, channels and lengths come from YouTube (checked 2026-10-06).

export type TopicKey =
  | 'fundamentals' | 'metrics' | 'regression' | 'gradient-descent' | 'regularization'
  | 'probability' | 'trees' | 'ensembles' | 'svm' | 'clustering' | 'pca'
  | 'neural-net' | 'optimizers' | 'cnn' | 'rnn' | 'embeddings' | 'attention'
  | 'transformer' | 'llm-training' | 'rlhf' | 'rag' | 'fine-tuning' | 'agents'
  | 'evals' | 'prompting' | 'review';

export type Phase = 1 | 2 | 3 | 4 | 5;

export type Seg = { id: string; title: string; channel: string; start: number; end: number; len: number; ranged: boolean };

export type Episode = {
  n: number;
  phase: Phase;
  topic: TopicKey;
  name: string;
  points: string[];
  segs: Seg[];
  review?: { title: string; q: string[] };
  secs: number;
};

import { POINTS } from './points';

const META: Record<string, [string, string, number]> = {"Gv9_4yMHFhI": ["A Gentle Introduction to Machine Learning", "StatQuest", 765], "EuBBz3bI-aA": ["Machine Learning Fundamentals: Bias and Variance", "StatQuest", 396], "fSytzGwwBVw": ["Machine Learning Fundamentals: Cross Validation", "StatQuest", 364], "Kdsp6soqA7o": ["Machine Learning Fundamentals: The Confusion Matrix", "StatQuest", 432], "HVXime0nQeI": ["StatQuest: K-nearest neighbors, Clearly Explained", "StatQuest", 330], "vP06aMoz4v8": ["Machine Learning Fundamentals: Sensitivity and Specificity", "StatQuest", 706], "sofffBNhVSo": ["Single Number Evaluation Metric (C3W1L03)", "DeepLearningAI", 436], "4jRBRDbJemM": ["ROC and AUC, Clearly Explained!", "StatQuest", 977], "XepXtl9YKwc": ["Maximum Likelihood, clearly explained!!!", "StatQuest", 372], "PaFPbb66DxQ": ["The Main Ideas of Fitting a Line to Data (The Main Ideas of Least Squares and Linear Regression.)", "StatQuest", 561], "yIYKR4sgzI8": ["StatQuest: Logistic Regression", "StatQuest", 527], "sDv4f4s2SB8": ["Gradient Descent, Step-by-Step", "StatQuest", 1434], "Q81RR3yKn30": ["Regularization Part 1: Ridge (L2) Regression", "StatQuest", 1226], "NGf0voTMlcs": ["Regularization Part 2: Lasso (L1) Regression", "StatQuest", 499], "Xm2C_gTAl8c": ["Ridge vs Lasso Regression, Visualized!!!", "StatQuest", 545], "O2L2Uv9pdDA": ["Naive Bayes, Clearly Explained!!!", "StatQuest", 912], "C1N_PDHuJ6Q": ["Basic Recipe for Machine Learning (C2W1L03)", "DeepLearningAI", 382], "_L39rN6gz7Y": ["Decision and Classification Trees, Clearly Explained!!!", "StatQuest", 1088], "g9c66TUylZ4": ["Regression Trees, Clearly Explained!!!", "StatQuest", 1353], "YtebGVx-Fxw": ["Entropy (for data science) Clearly Explained!!!", "StatQuest", 994], "J4Wdy0Wc_xQ": ["StatQuest: Random Forests Part 1 - Building, Using and Evaluating", "StatQuest", 594], "1waHlpKiNyY": ["Train/Dev/Test Sets (C2W1L01)", "DeepLearningAI", 725], "LsK-xG1cLYA": ["AdaBoost, Clearly Explained", "StatQuest", 1254], "3CC4N4z3GJc": ["Gradient Boost Part 1 (of 4): Regression Main Ideas", "StatQuest", 952], "jxuNLH5dXCs": ["Gradient Boost Part 3 (of 4): Classification", "StatQuest", 1022], "OtD8wVaFm6E": ["XGBoost Part 1 (of 4): Regression", "StatQuest", 1546], "efR1C6CvhmE": ["Support Vector Machines Part 1 (of 3): Main Ideas!!!", "StatQuest", 1232], "4b5d3muPQmA": ["StatQuest: K-means clustering", "StatQuest", 510], "7xHsRkOdVwo": ["StatQuest: Hierarchical Clustering", "StatQuest", 679], "FgakZw6K1QQ": ["StatQuest: Principal Component Analysis (PCA), Step-by-Step", "StatQuest", 1317], "NEaUSP4YerM": ["StatQuest: t-SNE, Clearly Explained", "StatQuest", 707], "RDZUdRSDOok": ["Clustering with DBSCAN, Clearly Explained!!!", "StatQuest", 569], "aircAruvnKk": ["But what is a neural network? | Deep learning chapter 1", "3Blue1Brown", 1120], "IHZwWFHWa-w": ["Gradient descent, how neural networks learn | Deep Learning Chapter 2", "3Blue1Brown", 1233], "Ilg3gGewQ5U": ["Backpropagation, intuitively | Deep Learning Chapter 3", "3Blue1Brown", 767], "68BZ5f7P94E": ["Neural Networks Pt. 3: ReLU In Action!!!", "StatQuest", 538], "KpKog-L9veg": ["Neural Networks Part 5: ArgMax and SoftMax", "StatQuest", 843], "6ArSys5qHAU": ["Neural Networks Part 6: Cross Entropy", "StatQuest", 571], "6g0t3Phly2M": ["Regularization (C2W1L04)", "DeepLearningAI", 582], "D8PJAL-MZv8": ["Dropout Regularization (C2W1L06)", "DeepLearningAI", 565], "FDCfw-YqWTE": ["Normalizing Inputs (C2W1L09)", "DeepLearningAI", 331], "qhXZsFVxGKo": ["Vanishing/Exploding Gradients (C2W1L10)", "DeepLearningAI", 367], "vMh0zPT0tLI": ["Stochastic Gradient Descent, Clearly Explained!!!", "StatQuest", 653], "4qJaSmvhxi8": ["Mini Batch Gradient Descent (C2W2L01)", "DeepLearningAI", 689], "JXQT_vxqwIs": ["Adam Optimization Algorithm (C2W2L08)", "DeepLearningAI", 428], "tNIpEZLv_eg": ["Normalizing Activations in a Network (C2W3L04)", "DeepLearningAI", 535], "yofjFQddwHE": ["Transfer Learning (C3W2L07)", "DeepLearningAI", 678], "JoAxZsdw_3w": ["Carrying Out Error Analysis (C3W2L01)", "DeepLearningAI", 632], "sfk5h0yC67o": ["Training and Testing on Different Distributions (C3W2L04)", "DeepLearningAI", 656], "HGwBXDKFk9I": ["Neural Networks Part 8: Image Classification with Convolutional Neural Networks (CNNs)", "StatQuest", 923], "ZILIbUvp5lk": ["ResNets (C4W2L03)", "DeepLearningAI", 428], "AsNTP8Kwu80": ["Recurrent Neural Networks (RNNs), Clearly Explained!!!", "StatQuest", 997], "YCzL96nL7j0": ["Long Short-Term Memory (LSTM), Clearly Explained", "StatQuest", 1245], "viZrOnJclY0": ["Word Embedding and Word2Vec, Clearly Explained!!!", "StatQuest", 971], "L8HKweZIOmg": ["Sequence-to-Sequence (seq2seq) Encoder-Decoder Neural Networks, Clearly Explained!!!", "StatQuest", 1010], "PSs6nxngL6k": ["Attention for Neural Networks, Clearly Explained!!!", "StatQuest", 950], "LPZh9BOjkQs": ["Large Language Models explained briefly", "3Blue1Brown", 478], "wjZofJX0v4M": ["Transformers, the tech behind LLMs | Deep Learning Chapter 5", "3Blue1Brown", 1634], "eMlx5fFNoYc": ["Attention in transformers, step-by-step | Deep Learning Chapter 6", "3Blue1Brown", 1569], "9-Jl0dxWQs8": ["How might LLMs store facts | Deep Learning Chapter 7", "3Blue1Brown", 1362], "zxQyTK8quyY": ["Transformer Neural Networks, ChatGPT's foundation, Clearly Explained!!!", "StatQuest", 2175], "bQ5BoolX9Ag": ["Decoder-Only Transformers, ChatGPTs specific Transformer, Clearly Explained!!!", "StatQuest", 2204], "GDN649X_acE": ["Encoder-Only Transformers (like BERT) for RAG, Clearly Explained!!!", "StatQuest", 1131], "zjkBMFhNj_g": ["[1hr Talk] Intro to Large Language Models", "Andrej Karpathy", 3588], "7xTGNNLPyMI": ["Deep Dive into LLMs like ChatGPT", "Andrej Karpathy", 12683], "qPN_XZcJf_s": ["Reinforcement Learning with Human Feedback (RLHF), Clearly Explained!!!", "StatQuest", 1081], "9vM4p9NN0Ts": ["Stanford CS229: Building Large Language Models (LLMs)", "Stanford Online", 6271], "T-D1OfcDW1M": ["What is Retrieval-Augmented Generation (RAG)?", "IBM Technology", 395], "e9U0QAFbfLI": ["Cosine Similarity, Clearly Explained!!!", "StatQuest", 613], "YDdKiQNw80c": ["Vector Search with LLMs - Computerphile", "Computerphile", 1217], "TRjq7t2Ms5I": ["Building Production-Ready RAG Applications: Jerry Liu", "AI Engineer", 1114], "kPL-6-9MVyA": ["RAG Agents in Prod: 10 Lessons We Learned (Douwe Kiela, creator of RAG)", "AI Engineer", 1016], "HdafI0t3sEY": ["RAG vs. CAG: Solving Knowledge Gaps in AI Models", "IBM Technology", 959], "zYGDpG-pTho": ["RAG vs Fine-Tuning vs Prompt Engineering: Optimizing AI Models", "IBM Technology", 790], "UabBYexBD4k": ["Is RAG Still Needed? Choosing the Best Approach for LLMs", "IBM Technology", 669], "PmW_TMQ3l0I": ["Stanford CME295 Transformers & LLMs | Lecture 5 - LLM tuning", "Stanford Online", 6461], "DhRoTONcyZE": ["What is Low-Rank Adaptation (LoRA) | explained by the inventor", "Edward Hu", 448], "o0gkdZBtwEg": ["How KV Cache Speeds Up LLMs for Faster AI Models on GPUs", "IBM Technology", 674], "F8NKVhkZZWI": ["What are AI Agents?", "IBM Technology", 748], "eur8dUO9mvE": ["What is MCP? Integrate AI Agents with Databases & APIs", "IBM Technology", 226], "D7_ipDqhtwk": ["How We Build Effective Agents: Barry Zhang, Anthropic", "AI Engineer", 909], "kn6dxL53NkM": ["MCP vs API Explained: Do You Really Need MCP?", "KodeKloud", 1037], "h-7S6HNq0Vg": ["Stanford CME295 Transformers & LLMs | Lecture 7 - Agentic LLMs", "Stanford Online", 6562], "8fNP4N46RRo": ["Stanford CME295 Transformers & LLMs | Lecture 8 - LLM Evaluation", "Stanford Online", 6565], "T9aRN5JkmL8": ["AI prompt engineering: A deep dive", "Anthropic", 4602], "LCEmiRjPEtQ": ["Andrej Karpathy: Software Is Changing (Again)", "Y Combinator", 2371], "iv-5mZ_9CPY": ["But how do AI images and videos actually work? | Guest video by Welch Labs", "3Blue1Brown", 2240], "BsWxPI9UM4c": ["Why AI evals are the hottest new skill for product builders | Hamel Husain & Shreya Shankar", "Lenny's Podcast", 6393], "EWvNQjAaOHw": ["How I use LLMs", "Andrej Karpathy", 7872]};

const sec = (t: string) => t.split(':').reduce((a, x) => a * 60 + +x, 0);

// "id" plays the whole video; ["id", "m:ss", "m:ss" | "end"] plays a slice.
type RawSeg = string | [string, string, string];

const seg = (g: RawSeg): Seg => {
  const [id, a, b] = Array.isArray(g) ? g : [g];
  const [title, channel, len] = META[id];
  const start = a ? sec(a) : 0;
  const end = b && b !== 'end' ? sec(b) : len;
  return { id, title, channel, start, end, len, ranged: !!a };
};

type Raw =
  | [Phase, TopicKey, string, RawSeg[]]
  | [Phase, 'review', string, { title: string; q: string[] }];

const RAW: Raw[] = [
  // ── Phase 1 · Classic ML ─────────────────────────
  [1, 'fundamentals', 'What Machine Learning Really Is', ['Gv9_4yMHFhI', 'EuBBz3bI-aA']],
  [1, 'fundamentals', 'Testing Honestly', ['fSytzGwwBVw', 'Kdsp6soqA7o', 'HVXime0nQeI']],
  [1, 'metrics', 'Sensitivity, Specificity & One Number', ['vP06aMoz4v8', 'sofffBNhVSo']],
  [1, 'metrics', 'ROC Curves & the Likelihood Game', ['4jRBRDbJemM', 'XepXtl9YKwc']],
  [1, 'regression', 'Lines, Logits & Least Squares', ['PaFPbb66DxQ', 'yIYKR4sgzI8']],
  [1, 'gradient-descent', 'Rolling Downhill', ['sDv4f4s2SB8']],
  [1, 'regularization', 'Ridge: Taming Overfit with L2', ['Q81RR3yKn30']],
  [1, 'regularization', 'Lasso & the Art of Zeroing Out', ['NGf0voTMlcs', 'Xm2C_gTAl8c']],
  [1, 'probability', 'Naive Bayes & the ML Recipe', ['O2L2Uv9pdDA', 'C1N_PDHuJ6Q']],
  [1, 'trees', 'Twenty Questions: Decision Trees', ['_L39rN6gz7Y']],
  [1, 'trees', 'Trees That Predict Numbers', ['g9c66TUylZ4']],
  [1, 'trees', 'Entropy: Measuring Surprise', ['YtebGVx-Fxw']],
  [1, 'ensembles', 'Forests & Fair Splits', ['J4Wdy0Wc_xQ', '1waHlpKiNyY']],
  [1, 'ensembles', 'AdaBoost: Learning from Mistakes', ['LsK-xG1cLYA']],
  [1, 'ensembles', 'Gradient Boosting: Chasing Residuals', ['3CC4N4z3GJc']],
  [1, 'ensembles', 'Gradient Boosting for Classes', ['jxuNLH5dXCs']],
  [1, 'ensembles', 'XGBoost: The Kaggle Workhorse', ['OtD8wVaFm6E']],
  [1, 'svm', 'Mind the Margin: SVMs', ['efR1C6CvhmE']],
  [1, 'clustering', 'Finding Groups', ['4b5d3muPQmA', '7xHsRkOdVwo']],
  [1, 'pca', 'PCA: Squashing Dimensions Wisely', ['FgakZw6K1QQ']],
  [1, 'clustering', 't-SNE Maps & DBSCAN Blobs', ['NEaUSP4YerM', 'RDZUdRSDOok']],
  [1, 'review', 'Checkpoint: Classic ML', { title: 'Review: classic ML', q: [
    'Bias vs variance. Which one does regularization fight, and which one do more features fight?',
    'Precision vs recall. Pick a case (spam, cancer screening) where each one matters more.',
    'What does ROC-AUC measure, and why is accuracy misleading on imbalanced data?',
    'L1 vs L2. Which one zeroes out features, and why?',
    'Bagging vs boosting. Random forest vs XGBoost in one line each.',
    'How does a decision tree choose a split? Gini vs entropy.',
    'K-means vs DBSCAN. When does K-means fail?',
    'What is PCA for, and what does a principal component actually mean?'] }],

  // ── Phase 2 · Neural nets ────────────────────────
  [2, 'neural-net', 'Neurons, Layers & Lots of Weights', ['aircAruvnKk']],
  [2, 'neural-net', 'How a Network Learns', ['IHZwWFHWa-w']],
  [2, 'neural-net', 'Backprop & the ReLU Bend', ['Ilg3gGewQ5U', '68BZ5f7P94E']],
  [2, 'neural-net', 'Softmax Meets Cross-Entropy', ['KpKog-L9veg', '6ArSys5qHAU']],
  [2, 'regularization', 'Keeping Nets Humble', ['6g0t3Phly2M', 'D8PJAL-MZv8']],
  [2, 'optimizers', 'Normalise, Stabilise, Go Stochastic', ['FDCfw-YqWTE', 'qhXZsFVxGKo', 'vMh0zPT0tLI']],
  [2, 'optimizers', 'Mini-Batches & Adam', ['4qJaSmvhxi8', 'JXQT_vxqwIs']],
  [2, 'optimizers', 'Batch Norm & Borrowed Brains', ['tNIpEZLv_eg', 'yofjFQddwHE']],
  [2, 'metrics', 'Debugging Models Like an Engineer', ['JoAxZsdw_3w', 'sfk5h0yC67o']],
  [2, 'cnn', 'Convolutions & Skip Connections', ['HGwBXDKFk9I', 'ZILIbUvp5lk']],
  [2, 'rnn', 'Networks with Memory', ['AsNTP8Kwu80']],
  [2, 'rnn', 'LSTMs: Remembering What Matters', ['YCzL96nL7j0']],
  [2, 'embeddings', 'Words as Vectors', ['viZrOnJclY0']],
  [2, 'rnn', 'Encode, Decode, Translate', ['L8HKweZIOmg']],
  [2, 'attention', 'Attention: Looking Back Smartly', ['PSs6nxngL6k']],
  [2, 'review', 'Checkpoint: Deep Learning', { title: 'Review: deep learning', q: [
    'Explain backprop in two sentences, without using the word “chain rule”.',
    'Why ReLU instead of sigmoid in hidden layers?',
    'Why do softmax and cross-entropy go together?',
    'Dropout, batch norm, weight decay. What problem does each one solve?',
    'SGD vs mini-batch vs Adam.',
    'What are vanishing gradients, and how did LSTMs and ResNets get around them?',
    'What does a word embedding capture? Why do king − man + woman ≈ queen?',
    'What bottleneck in seq2seq did attention fix?'] }],

  // ── Phase 3 · Transformers ───────────────────────
  [3, 'transformer', 'LLMs in a Nutshell', ['LPZh9BOjkQs', ['wjZofJX0v4M', '0:00', '13:00']]],
  [3, 'transformer', 'Inside the Transformer', [['wjZofJX0v4M', '13:00', 'end'], ['eMlx5fFNoYc', '0:00', '6:00']]],
  [3, 'attention', 'Attention, Step by Step', [['eMlx5fFNoYc', '6:00', 'end']]],
  [3, 'transformer', 'Where LLMs Keep Their Facts', ['9-Jl0dxWQs8']],
  [3, 'transformer', 'Transformers from Scratch I', [['zxQyTK8quyY', '0:00', '18:00']]],
  [3, 'transformer', 'Transformers from Scratch II', [['zxQyTK8quyY', '18:00', 'end']]],
  [3, 'transformer', 'Decoder-Only: How GPT Writes I', [['bQ5BoolX9Ag', '0:00', '18:30']]],
  [3, 'transformer', 'Decoder-Only: How GPT Writes II', [['bQ5BoolX9Ag', '18:30', 'end']]],
  [3, 'embeddings', 'BERT: Encoders for Retrieval', ['GDN649X_acE']],

  // ── Phase 4 · How LLMs are built ─────────────────
  [4, 'llm-training', 'Two Files: What an LLM Is', [['zjkBMFhNj_g', '0:00', '20:00']]],
  [4, 'llm-training', 'Scaling, Tools & System 2', [['zjkBMFhNj_g', '20:00', '40:00']]],
  [4, 'llm-training', 'The LLM OS & Its Attack Surface', [['zjkBMFhNj_g', '40:00', 'end']]],
  [4, 'llm-training', 'Deep Dive I: Downloading the Internet', [['7xTGNNLPyMI', '0:00', '21:00']]],
  [4, 'llm-training', 'Deep Dive II: The Network Inside', [['7xTGNNLPyMI', '21:00', '42:00']]],
  [4, 'llm-training', 'Deep Dive III: Base Models', [['7xTGNNLPyMI', '42:00', '1:03:00']]],
  [4, 'llm-training', 'Deep Dive IV: Becoming an Assistant', [['7xTGNNLPyMI', '1:03:00', '1:24:00']]],
  [4, 'llm-training', 'Deep Dive V: Memory & Tokens to Think', [['7xTGNNLPyMI', '1:24:00', '1:45:00']]],
  [4, 'llm-training', 'Deep Dive VI: Jagged Intelligence', [['7xTGNNLPyMI', '1:45:00', '2:06:00']]],
  [4, 'rlhf', 'Deep Dive VII: Learning by Practice', [['7xTGNNLPyMI', '2:06:00', '2:27:00']]],
  [4, 'rlhf', 'Deep Dive VIII: Thinking Models', [['7xTGNNLPyMI', '2:27:00', '2:48:00']]],
  [4, 'rlhf', 'Deep Dive IX: RLHF & Its Limits', [['7xTGNNLPyMI', '2:48:00', '3:09:00']]],
  [4, 'llm-training', 'Deep Dive X: What’s Next', [['7xTGNNLPyMI', '3:09:00', 'end']]],
  [4, 'rlhf', 'RLHF: Teaching Taste', ['qPN_XZcJf_s']],
  [4, 'llm-training', 'Building LLMs I: The Big Picture', [['9vM4p9NN0Ts', '0:00', '21:00']]],
  [4, 'llm-training', 'Building LLMs II: Evals & Data', [['9vM4p9NN0Ts', '21:00', '42:00']]],
  [4, 'llm-training', 'Building LLMs III: Scaling Laws', [['9vM4p9NN0Ts', '42:00', '1:03:00']]],
  [4, 'llm-training', 'Building LLMs IV: Post-Training', [['9vM4p9NN0Ts', '1:03:00', '1:24:00']]],
  [4, 'rlhf', 'Building LLMs V: RLHF, DPO & Systems', [['9vM4p9NN0Ts', '1:24:00', 'end']]],
  [4, 'review', 'Checkpoint: How LLMs Are Built', { title: 'Review: how LLMs are built', q: [
    'What are tokens, and why does an LLM struggle to count the r’s in “strawberry”?',
    'Pretraining vs supervised fine-tuning vs RLHF. What does each stage add?',
    'What is a reward model trained on?',
    'Q, K and V in attention. What does each one do?',
    'Encoder-only vs decoder-only. Why is GPT decoder-only and BERT encoder-only?',
    'Why do LLMs hallucinate? Name two ways to reduce it.',
    'What do scaling laws say, and why does data quality matter so much?',
    'What do “thinking” models do differently at inference time?'] }],

  // ── Phase 5 · AI engineering ─────────────────────
  [5, 'rag', 'RAG & Cosine Similarity', ['T-D1OfcDW1M', 'e9U0QAFbfLI']],
  [5, 'rag', 'Vector Search, Demystified', ['YDdKiQNw80c']],
  [5, 'rag', 'The Production RAG Playbook', ['TRjq7t2Ms5I']],
  [5, 'rag', 'Ten Lessons from RAG’s Creator', ['kPL-6-9MVyA']],
  [5, 'rag', 'RAG vs CAG', ['HdafI0t3sEY']],
  [5, 'fine-tuning', 'RAG, Fine-Tune or Prompt?', ['zYGDpG-pTho', 'UabBYexBD4k']],
  [5, 'fine-tuning', 'LLM Tuning I', [['PmW_TMQ3l0I', '0:00', '21:30']]],
  [5, 'fine-tuning', 'LLM Tuning II', [['PmW_TMQ3l0I', '21:30', '43:00']]],
  [5, 'rlhf', 'LLM Tuning III', [['PmW_TMQ3l0I', '43:00', '1:04:30']]],
  [5, 'rlhf', 'LLM Tuning IV', [['PmW_TMQ3l0I', '1:04:30', '1:26:00']]],
  [5, 'fine-tuning', 'LLM Tuning V', [['PmW_TMQ3l0I', '1:26:00', 'end']]],
  [5, 'fine-tuning', 'LoRA & the KV Cache', ['DhRoTONcyZE', 'o0gkdZBtwEg']],
  [5, 'agents', 'Agents & MCP 101', ['F8NKVhkZZWI', 'eur8dUO9mvE']],
  [5, 'agents', 'Building Effective Agents', ['D7_ipDqhtwk']],
  [5, 'agents', 'MCP vs Plain APIs', ['kn6dxL53NkM']],
  [5, 'agents', 'Agentic LLMs I', [['h-7S6HNq0Vg', '0:00', '22:00']]],
  [5, 'agents', 'Agentic LLMs II', [['h-7S6HNq0Vg', '22:00', '44:00']]],
  [5, 'agents', 'Agentic LLMs III', [['h-7S6HNq0Vg', '44:00', '1:06:00']]],
  [5, 'agents', 'Agentic LLMs IV', [['h-7S6HNq0Vg', '1:06:00', '1:28:00']]],
  [5, 'agents', 'Agentic LLMs V', [['h-7S6HNq0Vg', '1:28:00', 'end']]],
  [5, 'evals', 'Evaluating LLMs I', [['8fNP4N46RRo', '0:00', '22:00']]],
  [5, 'evals', 'Evaluating LLMs II', [['8fNP4N46RRo', '22:00', '44:00']]],
  [5, 'evals', 'Evaluating LLMs III', [['8fNP4N46RRo', '44:00', '1:06:00']]],
  [5, 'evals', 'Evaluating LLMs IV', [['8fNP4N46RRo', '1:06:00', '1:28:00']]],
  [5, 'evals', 'Evaluating LLMs V', [['8fNP4N46RRo', '1:28:00', 'end']]],
  [5, 'prompting', 'Prompt Engineering Roundtable I', [['T9aRN5JkmL8', '0:00', '19:00']]],
  [5, 'prompting', 'Prompt Engineering Roundtable II', [['T9aRN5JkmL8', '19:00', '38:00']]],
  [5, 'prompting', 'Prompt Engineering Roundtable III', [['T9aRN5JkmL8', '38:00', '57:00']]],
  [5, 'prompting', 'Prompt Engineering Roundtable IV', [['T9aRN5JkmL8', '57:00', 'end']]],
  [5, 'agents', 'Software 3.0', [['LCEmiRjPEtQ', '0:00', '20:00']]],
  [5, 'agents', 'Iron-Man Suits, Not Robots', [['LCEmiRjPEtQ', '20:00', 'end']]],
  [5, 'review', 'Mock Interview: ML & DL', { title: 'Mock interview: ML and deep learning', q: [
    'Your model has 99% train accuracy and 70% validation accuracy. What do you do, step by step?',
    'Your fraud dataset is 0.5% positive. Which metric do you use, and how do you handle the imbalance?',
    'Explain gradient boosting to a non-ML engineer.',
    'Why do we need a separate validation set and test set?',
    'Walk through self-attention for the sentence “the cat sat”.',
    'Why are transformers easier to parallelise than RNNs?'] }],
  [5, 'review', 'Mock Interview: AI Engineering', { title: 'Mock interview: AI engineering', q: [
    'Design a RAG bot over every IITM course handout. Cover chunking, embeddings, the vector DB, retrieval, reranking and the prompt.',
    'Users say the bot gives wrong answers. How do you find out whether retrieval or generation is at fault?',
    'RAG vs fine-tuning vs long context. Pick one for (a) company policies (b) a legal writing style (c) one 300-page PDF.',
    'What is LoRA, and why is it so much cheaper than full fine-tuning?',
    'Why does a KV cache speed up generation, and what does it cost?',
    'Workflow vs agent. When would you avoid building an agent?',
    'What problem does MCP solve that a plain REST API doesn’t?',
    'How would you evaluate an LLM feature before shipping it?'] }],
];

const REVIEW_SECS = 1200;

export const EPISODES: Episode[] = RAW.map((r, i) => {
  const [phase, topic, name, body] = r;
  const points = POINTS[i];
  if (topic === 'review') {
    return { n: i + 1, phase, topic, name, points, segs: [], review: body as Episode['review'], secs: REVIEW_SECS };
  }
  const segs = (body as RawSeg[]).map(seg);
  return { n: i + 1, phase, topic, name, points, segs, secs: segs.reduce((a, s) => a + (s.end - s.start), 0) };
});

export const TOTAL = EPISODES.length;

export const BONUS: Seg[] = ['iv-5mZ_9CPY', 'BsWxPI9UM4c', 'EWvNQjAaOHw'].map(seg);

export const PHASES: Record<Phase, { name: string; short: string }> = {
  1: { name: 'Classic ML', short: 'Classic ML' },
  2: { name: 'Neural nets', short: 'Neural nets' },
  3: { name: 'Transformers', short: 'Transformers' },
  4: { name: 'How LLMs are built', short: 'LLMs' },
  5: { name: 'AI engineering', short: 'AI eng' },
};

// Progress-ring groups. Classical ML splits into four rings; the rest is one ring per phase.
export type RingGroup = { key: string; name: string; from: number; to: number; extra?: number[] };
export const RING_CLUSTERS: { title: string; rings: RingGroup[] }[] = [
  { title: 'Classical ML', rings: [
    { key: 'found', name: 'Foundations', from: 1, to: 4, extra: [9, 22] },
    { key: 'reg', name: 'Regression', from: 5, to: 8 },
    { key: 'trees', name: 'Trees & ensembles', from: 10, to: 18 },
    { key: 'unsup', name: 'Unsupervised', from: 19, to: 21 },
  ] },
  { title: 'Deep learning & LLMs', rings: [
    { key: 'nn', name: 'Neural nets', from: 23, to: 38 },
    { key: 'tf', name: 'Transformers', from: 39, to: 47 },
    { key: 'llm', name: 'Building LLMs', from: 48, to: 67 },
    { key: 'eng', name: 'AI engineering', from: 68, to: 100 },
  ] },
];

export const ringMembers = (g: RingGroup) => {
  const out: number[] = [];
  for (let n = g.from; n <= g.to; n++) out.push(n);
  return out.concat(g.extra ?? []);
};
