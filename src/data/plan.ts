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
  summary: string;
  segs: Seg[];
  review?: { title: string; q: string[] };
  secs: number;
};

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
  | [Phase, TopicKey, string, string, RawSeg[]]
  | [Phase, 'review', string, string, { title: string; q: string[] }];

const RAW: Raw[] = [
  // ── Phase 1 · Classic ML ─────────────────────────
  [1, 'fundamentals', 'What Machine Learning Really Is', 'ML is just making predictions and classifications from data, then testing them on data the model never saw. Then the central tension: a model that is too simple misses the pattern (bias), and one that is too flexible memorises noise (variance).', ['Gv9_4yMHFhI', 'EuBBz3bI-aA']],
  [1, 'fundamentals', 'Testing Honestly', 'Cross-validation rotates which slice of data is held out, so every point gets to be test data once. The confusion matrix lays out hits and misses by class. K-nearest neighbours closes the episode: classify a point by asking its closest neighbours.', ['fSytzGwwBVw', 'Kdsp6soqA7o', 'HVXime0nQeI']],
  [1, 'metrics', 'Sensitivity, Specificity & One Number', 'Sensitivity is how many real positives you caught, specificity is how many real negatives you left alone. Andrew Ng then argues for one single evaluation metric (like F1) so you can actually pick a winner between models.', ['vP06aMoz4v8', 'sofffBNhVSo']],
  [1, 'metrics', 'ROC Curves & the Likelihood Game', 'An ROC curve sweeps every classification threshold and plots true-positive rate against false-positive rate. AUC sums it up in one number. Maximum likelihood shows how we choose the parameters that make the observed data most probable.', ['4jRBRDbJemM', 'XepXtl9YKwc']],
  [1, 'regression', 'Lines, Logits & Least Squares', 'Linear regression finds the line that minimises the sum of squared residuals. Logistic regression bends that idea into an S-curve so the output becomes a probability of belonging to a class.', ['PaFPbb66DxQ', 'yIYKR4sgzI8']],
  [1, 'gradient-descent', 'Rolling Downhill', 'Gradient descent, one step at a time: take the derivative of the loss, step against it, and shrink the steps as the slope flattens. The learning rate controls how big each step is. This is the engine under almost every model to come.', ['sDv4f4s2SB8']],
  [1, 'regularization', 'Ridge: Taming Overfit with L2', 'Ridge regression adds a penalty on the squared size of the weights. A little bias is traded for a big drop in variance, and cross-validation picks how strong the penalty (lambda) should be.', ['Q81RR3yKn30']],
  [1, 'regularization', 'Lasso & the Art of Zeroing Out', 'Lasso penalises the absolute size of the weights, which can push useless features all the way to zero, so it does feature selection for free. The visual comparison shows why the L1 diamond hits corners while the L2 circle does not.', ['NGf0voTMlcs', 'Xm2C_gTAl8c']],
  [1, 'probability', 'Naive Bayes & the ML Recipe', 'Naive Bayes multiplies word probabilities as if every feature were independent, and it works surprisingly well for spam. Then Andrew Ng’s recipe: high bias → bigger model, high variance → more data or regularisation.', ['O2L2Uv9pdDA', 'C1N_PDHuJ6Q']],
  [1, 'trees', 'Twenty Questions: Decision Trees', 'A classification tree asks yes/no questions about features, choosing each split by how much it lowers Gini impurity. Leaves vote for a class, and pruning keeps the tree from memorising the training set.', ['_L39rN6gz7Y']],
  [1, 'trees', 'Trees That Predict Numbers', 'Regression trees split the data so each leaf predicts the average of the points inside it. Splits are chosen to minimise squared error, and a minimum leaf size stops the tree from overfitting.', ['g9c66TUylZ4']],
  [1, 'trees', 'Entropy: Measuring Surprise', 'Entropy is the expected surprise of an outcome: zero when you know the answer, highest when every outcome is equally likely. It is the other way to score a tree split, and it shows up again in cross-entropy loss.', ['YtebGVx-Fxw']],
  [1, 'ensembles', 'Forests & Fair Splits', 'A random forest grows many trees on bootstrapped data and random subsets of features, then lets them vote. Out-of-bag samples give free validation. Andrew Ng then explains how to split train, dev and test sets when you have big data.', ['J4Wdy0Wc_xQ', '1waHlpKiNyY']],
  [1, 'ensembles', 'AdaBoost: Learning from Mistakes', 'AdaBoost builds tiny one-split trees (stumps) in sequence. Each new stump puts more weight on the samples the last ones got wrong, and better stumps get a bigger say in the final vote.', ['LsK-xG1cLYA']],
  [1, 'ensembles', 'Gradient Boosting: Chasing Residuals', 'Gradient boosting starts with an average, then keeps adding small trees that predict the leftover errors (residuals). A learning rate scales each tree, so many small steps beat one big leap.', ['3CC4N4z3GJc']],
  [1, 'ensembles', 'Gradient Boosting for Classes', 'The same residual-chasing idea, now for yes/no outcomes. Predictions live in log-odds and turn into probabilities through the logistic function, so the trees fit residuals of probabilities.', ['jxuNLH5dXCs']],
  [1, 'ensembles', 'XGBoost: The Kaggle Workhorse', 'XGBoost builds its own kind of tree, scoring splits with a similarity score and gain, and pruning with gamma. A regularisation term (lambda) keeps leaf outputs modest. This is why it wins on tabular data.', ['OtD8wVaFm6E']],
  [1, 'svm', 'Mind the Margin: SVMs', 'Support vector machines find the boundary with the widest margin between classes, allowing a few misclassifications (a soft margin). Kernels lift data into higher dimensions where a straight cut works.', ['efR1C6CvhmE']],
  [1, 'clustering', 'Finding Groups', 'K-means drops K centres and keeps reassigning points until the clusters stop moving, and the elbow plot helps pick K. Hierarchical clustering merges the most similar items step by step into a dendrogram.', ['4b5d3muPQmA', '7xHsRkOdVwo']],
  [1, 'pca', 'PCA: Squashing Dimensions Wisely', 'PCA finds the directions along which the data varies most. The first principal component captures the most spread, the scree plot shows how much each one explains, and loadings tell you which features drive it.', ['FgakZw6K1QQ']],
  [1, 'clustering', 't-SNE Maps & DBSCAN Blobs', 't-SNE squashes high-dimensional data into a 2D map that keeps neighbours together. DBSCAN finds clusters of any shape by growing out from dense core points, and labels the stragglers as outliers.', ['NEaUSP4YerM', 'RDZUdRSDOok']],
  [1, 'review', 'Checkpoint: Classic ML', 'No video today. Answer each question in your head while you eat. Anything you can’t explain cleanly goes on a rewatch list.', { title: 'Review: classic ML', q: [
    'Bias vs variance. Which one does regularization fight, and which one do more features fight?',
    'Precision vs recall. Pick a case (spam, cancer screening) where each one matters more.',
    'What does ROC-AUC measure, and why is accuracy misleading on imbalanced data?',
    'L1 vs L2. Which one zeroes out features, and why?',
    'Bagging vs boosting. Random forest vs XGBoost in one line each.',
    'How does a decision tree choose a split? Gini vs entropy.',
    'K-means vs DBSCAN. When does K-means fail?',
    'What is PCA for, and what does a principal component actually mean?'] }],

  // ── Phase 2 · Neural nets ────────────────────────
  [2, 'neural-net', 'Neurons, Layers & Lots of Weights', '3Blue1Brown builds a digit-reading network from scratch: neurons hold numbers, weights and biases decide how each layer lights up the next, and the whole thing is one big function with about 13,000 knobs.', ['aircAruvnKk']],
  [2, 'neural-net', 'How a Network Learns', 'Learning means turning those 13,000 knobs to lower a cost function. Gradient descent in thousands of dimensions, and an honest look at what the hidden layers actually learned (spoiler: not neat edges).', ['IHZwWFHWa-w']],
  [2, 'neural-net', 'Backprop & the ReLU Bend', 'Backpropagation traces blame for the error backwards through the network, nudging each weight in proportion to its influence. StatQuest then shows how ReLU activations bend straight lines into flexible shapes.', ['Ilg3gGewQ5U', '68BZ5f7P94E']],
  [2, 'neural-net', 'Softmax Meets Cross-Entropy', 'Softmax turns raw output scores into probabilities that sum to one, while ArgMax just picks the biggest. Cross-entropy then scores those probabilities and punishes confident wrong answers hard.', ['KpKog-L9veg', '6ArSys5qHAU']],
  [2, 'regularization', 'Keeping Nets Humble', 'L2 weight decay shrinks weights towards zero in neural nets, and dropout randomly switches off neurons during training so no single unit becomes a crutch. Both fight overfitting.', ['6g0t3Phly2M', 'D8PJAL-MZv8']],
  [2, 'optimizers', 'Normalise, Stabilise, Go Stochastic', 'Normalised inputs make the loss surface round instead of stretched. Deep stacks can make gradients vanish or explode, and careful initialisation helps. Stochastic gradient descent uses random samples to step fast.', ['FDCfw-YqWTE', 'qhXZsFVxGKo', 'vMh0zPT0tLI']],
  [2, 'optimizers', 'Mini-Batches & Adam', 'Mini-batches sit between one sample and the full dataset, giving noisy but fast updates. Adam combines momentum with per-parameter learning rates, which is why it became the default optimiser.', ['4qJaSmvhxi8', 'JXQT_vxqwIs']],
  [2, 'optimizers', 'Batch Norm & Borrowed Brains', 'Batch normalisation keeps each layer’s inputs in a steady range so training is faster and less fragile. Transfer learning reuses a network trained on a huge dataset and fine-tunes it for your small one.', ['tNIpEZLv_eg', 'yofjFQddwHE']],
  [2, 'metrics', 'Debugging Models Like an Engineer', 'Error analysis: look at 100 mistakes by hand and count the causes before you pick what to fix. Then how to handle training data that comes from a different distribution than the users you care about.', ['JoAxZsdw_3w', 'sfk5h0yC67o']],
  [2, 'cnn', 'Convolutions & Skip Connections', 'CNNs slide small filters over an image to detect edges and patterns, then pool to shrink it. ResNets add skip connections so a 100-layer network can still learn, because gradients get a shortcut home.', ['HGwBXDKFk9I', 'ZILIbUvp5lk']],
  [2, 'rnn', 'Networks with Memory', 'Recurrent networks reuse the same weights at every time step and pass a hidden state forward, so they can read sequences of any length. The catch: gradients vanish or explode over long sequences.', ['AsNTP8Kwu80']],
  [2, 'rnn', 'LSTMs: Remembering What Matters', 'The LSTM adds a long-term memory lane and three gates (forget, input, output) that decide what to keep, add and reveal. This lets the network carry information across many steps without the gradient dying.', ['YCzL96nL7j0']],
  [2, 'embeddings', 'Words as Vectors', 'Word embeddings place words in a space where similar meanings sit close together. Word2Vec learns them by predicting neighbouring words (skip-gram and CBOW), using negative sampling to keep training cheap.', ['viZrOnJclY0']],
  [2, 'rnn', 'Encode, Decode, Translate', 'Seq2seq models read a sentence with an encoder LSTM, squeeze it into a context vector, and let a decoder LSTM write the translation one token at a time. That single vector becomes the bottleneck.', ['L8HKweZIOmg']],
  [2, 'attention', 'Attention: Looking Back Smartly', 'Attention lets the decoder look straight at every encoder output and weight them by similarity, instead of relying on one squeezed vector. This idea is the seed of the transformer.', ['PSs6nxngL6k']],
  [2, 'review', 'Checkpoint: Deep Learning', 'No video today. Talk yourself through each answer. Anything shaky goes on a rewatch list.', { title: 'Review: deep learning', q: [
    'Explain backprop in two sentences, without using the word “chain rule”.',
    'Why ReLU instead of sigmoid in hidden layers?',
    'Why do softmax and cross-entropy go together?',
    'Dropout, batch norm, weight decay. What problem does each one solve?',
    'SGD vs mini-batch vs Adam.',
    'What are vanishing gradients, and how did LSTMs and ResNets get around them?',
    'What does a word embedding capture? Why do king − man + woman ≈ queen?',
    'What bottleneck in seq2seq did attention fix?'] }],

  // ── Phase 3 · Transformers ───────────────────────
  [3, 'transformer', 'LLMs in a Nutshell', 'A short tour of what a large language model does: predict the next word, over and over. Then the start of 3Blue1Brown’s transformer chapter, covering tokens, embeddings and how data flows through the model.', ['LPZh9BOjkQs', ['wjZofJX0v4M', '0:00', '13:00']]],
  [3, 'transformer', 'Inside the Transformer', 'The rest of the transformer overview: the unembedding matrix, softmax with temperature, and how the final vector becomes a probability for every possible next token. Then the opening of the attention chapter.', [['wjZofJX0v4M', '13:00', 'end'], ['eMlx5fFNoYc', '0:00', '6:00']]],
  [3, 'attention', 'Attention, Step by Step', 'Queries ask, keys answer, and values carry the update. Attention patterns, masking so tokens can’t peek at the future, multi-head attention, and how many parameters all of this actually costs.', [['eMlx5fFNoYc', '6:00', 'end']]],
  [3, 'transformer', 'Where LLMs Keep Their Facts', 'The multilayer perceptron blocks between the attention layers seem to store facts like “Michael Jordan plays basketball”. Also superposition: how a model packs more features than it has dimensions.', ['9-Jl0dxWQs8']],
  [3, 'transformer', 'Transformers from Scratch I', 'StatQuest builds a transformer by hand: word embeddings, positional encoding with sine waves, and self-attention, which lets each word work out which other words matter to it.', [['zxQyTK8quyY', '0:00', '18:00']]],
  [3, 'transformer', 'Transformers from Scratch II', 'The encoder-decoder transformer finishes: residual connections, encoder-decoder attention, and the decoder producing the translated sentence one token at a time.', [['zxQyTK8quyY', '18:00', 'end']]],
  [3, 'transformer', 'Decoder-Only: How GPT Writes I', 'The architecture behind ChatGPT. A decoder-only transformer uses masked self-attention over both prompt and output, so the same machinery reads your question and writes the answer.', [['bQ5BoolX9Ag', '0:00', '18:30']]],
  [3, 'transformer', 'Decoder-Only: How GPT Writes II', 'How a decoder-only model generates a response token by token, and how it differs from the original encoder-decoder transformer in training and in use.', [['bQ5BoolX9Ag', '18:30', 'end']]],
  [3, 'embeddings', 'BERT: Encoders for Retrieval', 'Encoder-only transformers like BERT read the whole sentence at once to build context-aware embeddings. Those embeddings power classification and the retrieval step of RAG.', ['GDN649X_acE']],

  // ── Phase 4 · How LLMs are built ─────────────────
  [4, 'llm-training', 'Two Files: What an LLM Is', 'Karpathy’s busy-person intro. An LLM is a parameters file plus a little run code. Pretraining compresses the internet into those parameters, and fine-tuning turns that document generator into an assistant.', [['zjkBMFhNj_g', '0:00', '20:00']]],
  [4, 'llm-training', 'Scaling, Tools & System 2', 'Scaling laws make bigger models predictably better. LLMs learn to use tools such as browsers, calculators and code, and go multimodal. Then the open questions: slow System-2 thinking and self-improvement.', [['zjkBMFhNj_g', '20:00', '40:00']]],
  [4, 'llm-training', 'The LLM OS & Its Attack Surface', 'The LLM as the kernel of a new operating system. Then the security side: jailbreaks, prompt injection and data poisoning, and why they are hard to stamp out.', [['zjkBMFhNj_g', '40:00', 'end']]],
  [4, 'llm-training', 'Deep Dive I: Downloading the Internet', 'Karpathy’s 3.5-hour deep dive begins. Pretraining data comes from filtered web crawls, and tokenisation turns text into the symbol sequences the network actually sees.', [['7xTGNNLPyMI', '0:00', '21:00']]],
  [4, 'llm-training', 'Deep Dive II: The Network Inside', 'What the neural network computes, how inference samples one token at a time, and a look back at training GPT-2.', [['7xTGNNLPyMI', '21:00', '42:00']]],
  [4, 'llm-training', 'Deep Dive III: Base Models', 'A base model is an internet document simulator. It can recite, autocomplete and even follow few-shot prompts, but it is not yet an assistant.', [['7xTGNNLPyMI', '42:00', '1:03:00']]],
  [4, 'llm-training', 'Deep Dive IV: Becoming an Assistant', 'Post-training on conversations made by human labellers turns the base model into a helpful assistant. And the first look at hallucinations: why models confidently make things up.', [['7xTGNNLPyMI', '1:03:00', '1:24:00']]],
  [4, 'llm-training', 'Deep Dive V: Memory & Tokens to Think', 'Mitigating hallucinations with tool use, the difference between knowledge stored in weights and the working memory of the context window, and why models need tokens to think.', [['7xTGNNLPyMI', '1:24:00', '1:45:00']]],
  [4, 'llm-training', 'Deep Dive VI: Jagged Intelligence', 'Why LLMs can solve olympiad problems yet fail at counting letters or comparing 9.11 with 9.9. Tokenisation and the Swiss-cheese shape of model ability.', [['7xTGNNLPyMI', '1:45:00', '2:06:00']]],
  [4, 'rlhf', 'Deep Dive VII: Learning by Practice', 'Reinforcement learning is the third stage: like doing practice problems instead of reading worked examples. Models try many solutions and reinforce the ones that reach correct answers.', [['7xTGNNLPyMI', '2:06:00', '2:27:00']]],
  [4, 'rlhf', 'Deep Dive VIII: Thinking Models', 'DeepSeek-R1 and the rise of “thinking” models whose chains of thought grow through RL. The AlphaGo comparison: RL can discover strategies no human demonstrated.', [['7xTGNNLPyMI', '2:27:00', '2:48:00']]],
  [4, 'rlhf', 'Deep Dive IX: RLHF & Its Limits', 'RLHF for tasks without a checkable answer: train a reward model to imitate human preferences. It helps, but the model can game the reward, so you can’t run it forever.', [['7xTGNNLPyMI', '2:48:00', '3:09:00']]],
  [4, 'llm-training', 'Deep Dive X: What’s Next', 'Where things are heading (multimodality, agents, longer tasks), how to keep up, and where to find and run models yourself. A recap of the full pipeline.', [['7xTGNNLPyMI', '3:09:00', 'end']]],
  [4, 'rlhf', 'RLHF: Teaching Taste', 'StatQuest walks through RLHF: supervised fine-tuning, collecting human rankings, training a reward model on them, and using reinforcement learning to push the LLM towards preferred answers.', ['qPN_XZcJf_s']],
  [4, 'llm-training', 'Building LLMs I: The Big Picture', 'Stanford CS229 guest lecture. What really matters when building LLMs (data, evaluation and systems more than architecture), then pretraining as language modelling and tokenisation.', [['9vM4p9NN0Ts', '0:00', '21:00']]],
  [4, 'llm-training', 'Building LLMs II: Evals & Data', 'How pretrained models are evaluated with perplexity and benchmarks, and the long, messy pipeline for collecting and cleaning web-scale pretraining data.', [['9vM4p9NN0Ts', '21:00', '42:00']]],
  [4, 'llm-training', 'Building LLMs III: Scaling Laws', 'Scaling laws predict loss from compute, data and parameters, which tells you how to spend a training budget. The real cost of training a frontier model.', [['9vM4p9NN0Ts', '42:00', '1:03:00']]],
  [4, 'llm-training', 'Building LLMs IV: Post-Training', 'Turning a language model into an assistant with supervised fine-tuning, and why surprisingly little high-quality data goes a long way.', [['9vM4p9NN0Ts', '1:03:00', '1:24:00']]],
  [4, 'rlhf', 'Building LLMs V: RLHF, DPO & Systems', 'Preference tuning with RLHF and the simpler DPO, how chat models are evaluated, and the systems tricks (low precision, operator fusion) that make training affordable.', [['9vM4p9NN0Ts', '1:24:00', 'end']]],
  [4, 'review', 'Checkpoint: How LLMs Are Built', 'No video today. Walk through the full LLM pipeline from memory. Anything you can’t explain goes on a rewatch list.', { title: 'Review: how LLMs are built', q: [
    'What are tokens, and why does an LLM struggle to count the r’s in “strawberry”?',
    'Pretraining vs supervised fine-tuning vs RLHF. What does each stage add?',
    'What is a reward model trained on?',
    'Q, K and V in attention. What does each one do?',
    'Encoder-only vs decoder-only. Why is GPT decoder-only and BERT encoder-only?',
    'Why do LLMs hallucinate? Name two ways to reduce it.',
    'What do scaling laws say, and why does data quality matter so much?',
    'What do “thinking” models do differently at inference time?'] }],

  // ── Phase 5 · AI engineering ─────────────────────
  [5, 'rag', 'RAG & Cosine Similarity', 'Retrieval-augmented generation fetches relevant documents and hands them to the LLM, so answers are current and sourced. Cosine similarity is how “relevant” gets measured between embedding vectors.', ['T-D1OfcDW1M', 'e9U0QAFbfLI']],
  [5, 'rag', 'Vector Search, Demystified', 'Computerphile on how vector databases find the nearest embeddings fast, without comparing your query to every single document. This is the retrieval engine behind RAG.', ['YDdKiQNw80c']],
  [5, 'rag', 'The Production RAG Playbook', 'Jerry Liu (LlamaIndex) on why naive RAG breaks: bad chunking, weak retrieval and missing context. Then the fixes: smarter chunking, metadata, reranking and agentic retrieval.', ['TRjq7t2Ms5I']],
  [5, 'rag', 'Ten Lessons from RAG’s Creator', 'Douwe Kiela, who co-authored the original RAG paper, on what actually works in enterprise deployments. Systems matter more than models, expertise beats generic, and you should design for inaccuracy.', ['kPL-6-9MVyA']],
  [5, 'rag', 'RAG vs CAG', 'Retrieval-augmented vs cache-augmented generation: fetch documents on demand, or preload the whole knowledge base into a long context and its KV cache. The trade-offs in accuracy, latency and scale.', ['HdafI0t3sEY']],
  [5, 'fine-tuning', 'RAG, Fine-Tune or Prompt?', 'Three ways to make a model better at your task: prompting, retrieval and fine-tuning. What each one costs, what each one fixes, and whether long context windows make RAG obsolete.', ['zYGDpG-pTho', 'UabBYexBD4k']],
  [5, 'fine-tuning', 'LLM Tuning I', 'Stanford CME295 lecture 5 begins: what happens after pretraining, and why a raw model needs to be tuned to follow instructions and match human preferences.', [['PmW_TMQ3l0I', '0:00', '21:30']]],
  [5, 'fine-tuning', 'LLM Tuning II', 'The lecture continues into supervised fine-tuning: instruction data, what it teaches the model, and where it falls short.', [['PmW_TMQ3l0I', '21:30', '43:00']]],
  [5, 'rlhf', 'LLM Tuning III', 'Preference data and reward modelling: teaching a model which of two answers people prefer.', [['PmW_TMQ3l0I', '43:00', '1:04:30']]],
  [5, 'rlhf', 'LLM Tuning IV', 'Optimising against the reward: reinforcement-learning methods and the simpler direct-preference alternatives used to align models.', [['PmW_TMQ3l0I', '1:04:30', '1:26:00']]],
  [5, 'fine-tuning', 'LLM Tuning V', 'The lecture wraps up with parameter-efficient tuning and the practical choices behind tuning a model in the real world.', [['PmW_TMQ3l0I', '1:26:00', 'end']]],
  [5, 'fine-tuning', 'LoRA & the KV Cache', 'LoRA’s inventor explains fine-tuning with tiny low-rank update matrices instead of every weight, which is why it is so cheap. Then the KV cache: reusing past keys and values so generation doesn’t recompute everything.', ['DhRoTONcyZE', 'o0gkdZBtwEg']],
  [5, 'agents', 'Agents & MCP 101', 'What makes an AI system an agent: it reasons, plans, and calls tools in a loop. MCP is the open protocol that gives agents a standard way to plug into databases and APIs.', ['F8NKVhkZZWI', 'eur8dUO9mvE']],
  [5, 'agents', 'Building Effective Agents', 'Anthropic’s Barry Zhang: don’t build agents for everything, keep them simple, and think like your agent. When a workflow beats an agent, and what an agent really is under the hood.', ['D7_ipDqhtwk']],
  [5, 'agents', 'MCP vs Plain APIs', 'Do you really need MCP when REST APIs exist? How MCP servers describe tools to models, what problems that solves, and when a plain API call is enough.', ['kn6dxL53NkM']],
  [5, 'agents', 'Agentic LLMs I', 'Stanford CME295 lecture 7: from chatbots to agents. Grounding a model with retrieval and giving it tools to act in the world.', [['h-7S6HNq0Vg', '0:00', '22:00']]],
  [5, 'agents', 'Agentic LLMs II', 'How tool calling works: the model emits structured calls, the system runs them, and the results flow back into the context.', [['h-7S6HNq0Vg', '22:00', '44:00']]],
  [5, 'agents', 'Agentic LLMs III', 'Agent loops that reason and act, like ReAct. Planning, observing results and deciding the next step.', [['h-7S6HNq0Vg', '44:00', '1:06:00']]],
  [5, 'agents', 'Agentic LLMs IV', 'Scaling agents up: longer tasks, multiple cooperating agents, and protocols for connecting them to tools.', [['h-7S6HNq0Vg', '1:06:00', '1:28:00']]],
  [5, 'agents', 'Agentic LLMs V', 'The lecture closes on what goes wrong with agents (safety, reliability, cost) and where the field is heading.', [['h-7S6HNq0Vg', '1:28:00', 'end']]],
  [5, 'evals', 'Evaluating LLMs I', 'Stanford CME295 lecture 8: why evaluating free-form LLM output is hard, and the role of human judgement as the gold standard.', [['8fNP4N46RRo', '0:00', '22:00']]],
  [5, 'evals', 'Evaluating LLMs II', 'Automatic metrics and their blind spots: why word-overlap scores miss what people actually care about.', [['8fNP4N46RRo', '22:00', '44:00']]],
  [5, 'evals', 'Evaluating LLMs III', 'LLM-as-a-judge: using a strong model to grade outputs, plus the biases (position, length, self-preference) you need to watch for.', [['8fNP4N46RRo', '44:00', '1:06:00']]],
  [5, 'evals', 'Evaluating LLMs IV', 'Benchmarks for knowledge, reasoning, coding and agents, and how to read leaderboards without being fooled by contamination.', [['8fNP4N46RRo', '1:06:00', '1:28:00']]],
  [5, 'evals', 'Evaluating LLMs V', 'Wrapping up evaluation: picking the right mix of methods for a real product, and the open problems.', [['8fNP4N46RRo', '1:28:00', 'end']]],
  [5, 'prompting', 'Prompt Engineering Roundtable I', 'Anthropic’s prompt engineers on what prompt engineering really is. Clear communication, iteration, and treating the model like a brilliant new hire who lacks context.', [['T9aRN5JkmL8', '0:00', '19:00']]],
  [5, 'prompting', 'Prompt Engineering Roundtable II', 'What separates a good prompt engineer: reading model outputs closely, anticipating edge cases, and being honest with the model about the task.', [['T9aRN5JkmL8', '19:00', '38:00']]],
  [5, 'prompting', 'Prompt Engineering Roundtable III', 'Role-play, examples and chain of thought: which tricks still help with modern models, and which are superstition.', [['T9aRN5JkmL8', '38:00', '57:00']]],
  [5, 'prompting', 'Prompt Engineering Roundtable IV', 'How prompting has changed as models got smarter, and where it goes next as models start to help write their own prompts.', [['T9aRN5JkmL8', '57:00', 'end']]],
  [5, 'agents', 'Software 3.0', 'Karpathy’s YC keynote: Software 1.0 is code, 2.0 is neural network weights, and 3.0 is prompts in English. LLMs as utilities, fabs and operating systems, and their odd psychology.', [['LCEmiRjPEtQ', '0:00', '20:00']]],
  [5, 'agents', 'Iron-Man Suits, Not Robots', 'Build partial-autonomy apps with an autonomy slider and a fast human verification loop, then design docs and tools that agents can read. The decade of agents, not the year.', [['LCEmiRjPEtQ', '20:00', 'end']]],
  [5, 'review', 'Mock Interview: ML & DL', 'No video today. Answer out loud as if an interviewer were across the mess table.', { title: 'Mock interview: ML and deep learning', q: [
    'Your model has 99% train accuracy and 70% validation accuracy. What do you do, step by step?',
    'Your fraud dataset is 0.5% positive. Which metric do you use, and how do you handle the imbalance?',
    'Explain gradient boosting to a non-ML engineer.',
    'Why do we need a separate validation set and test set?',
    'Walk through self-attention for the sentence “the cat sat”.',
    'Why are transformers easier to parallelise than RNNs?'] }],
  [5, 'review', 'Mock Interview: AI Engineering', 'The final episode. A system-design round on everything you’ve built up over the plan.', { title: 'Mock interview: AI engineering', q: [
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
  const [phase, topic, name, summary, body] = r;
  if (topic === 'review') {
    return { n: i + 1, phase, topic, name, summary, segs: [], review: body as Episode['review'], secs: REVIEW_SECS };
  }
  const segs = (body as RawSeg[]).map(seg);
  return { n: i + 1, phase, topic, name, summary, segs, secs: segs.reduce((a, s) => a + (s.end - s.start), 0) };
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
    { key: 'found', name: 'Foundations & metrics', from: 1, to: 4, extra: [9, 22] },
    { key: 'reg', name: 'Regression & optimisation', from: 5, to: 8 },
    { key: 'trees', name: 'Trees, ensembles & SVM', from: 10, to: 18 },
    { key: 'unsup', name: 'Unsupervised', from: 19, to: 21 },
  ] },
  { title: 'Deep learning & LLMs', rings: [
    { key: 'nn', name: 'Neural nets', from: 23, to: 38 },
    { key: 'tf', name: 'Transformers', from: 39, to: 47 },
    { key: 'llm', name: 'How LLMs are built', from: 48, to: 67 },
    { key: 'eng', name: 'AI engineering', from: 68, to: 100 },
  ] },
];

export const ringMembers = (g: RingGroup) => {
  const out: number[] = [];
  for (let n = g.from; n <= g.to; n++) out.push(n);
  return out.concat(g.extra ?? []);
};
