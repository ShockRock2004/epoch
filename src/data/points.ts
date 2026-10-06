// What each episode covers, as short bullets. Index 0 is episode 1.
// Plain, conversational, one idea per bullet.

export const POINTS: string[][] = [
  // ── Phase 1 · Classic ML ─────────────────────────
  [ // 1
    'Machine learning is just using data to make predictions or sort things into groups.',
    'You judge a model on data it has never seen, not the data it learned from.',
    'Too simple and it misses the pattern (bias). Too flexible and it memorises noise (variance).',
  ],
  [ // 2
    'Cross-validation takes turns holding out a slice of data, so every point gets tested once.',
    'A confusion matrix shows what the model got right and wrong, class by class.',
    'K-nearest neighbours labels a new point by letting its closest neighbours vote.',
  ],
  [ // 3
    'Sensitivity: of the real positives, how many did you catch?',
    'Specificity: of the real negatives, how many did you correctly leave alone?',
    'Pick one main number, like F1, so comparing models is quick.',
  ],
  [ // 4
    'An ROC curve shows the trade-off between catching positives and raising false alarms at every threshold.',
    'AUC turns that curve into one score: 1 is perfect, 0.5 is guessing.',
    'Maximum likelihood picks the parameters that make your data most likely.',
  ],
  [ // 5
    'Linear regression draws the line that keeps the squared errors as small as possible.',
    'R² tells you how much of the variation that line explains.',
    'Logistic regression bends the line into an S-curve so it outputs a probability.',
  ],
  [ // 6
    'Gradient descent finds good parameters by stepping downhill on the loss, again and again.',
    'The slope tells you which way to step. The learning rate decides how far.',
    'This is the engine behind almost every model that comes later.',
  ],
  [ // 7
    'Ridge adds a penalty for large weights on top of the usual loss.',
    'You accept a little bias to get a big drop in variance, so it generalises better.',
    'Cross-validation picks how strong the penalty (lambda) should be.',
  ],
  [ // 8
    'Lasso penalises the absolute size of the weights instead of their square.',
    'That can push useless features all the way to zero, so it doubles as feature selection.',
    'The side-by-side visual shows why L1 lands on corners and L2 does not.',
  ],
  [ // 9
    'Naive Bayes multiplies word probabilities and pretends every feature is independent.',
    'The assumption is wrong, but it works surprisingly well, especially for spam.',
    'The basic recipe: high bias means a bigger model, high variance means more data or regularisation.',
  ],
  [ // 10
    'A decision tree asks a chain of yes/no questions about your features.',
    'Each split is chosen to make the groups as pure as possible (lowest Gini impurity).',
    'Pruning stops the tree from memorising the training set.',
  ],
  [ // 11
    'Same idea as a decision tree, but each leaf predicts a number: the average of its points.',
    'Splits are picked to minimise squared error.',
    'A minimum leaf size keeps it from overfitting.',
  ],
  [ // 12
    'Entropy measures surprise: zero when you know the outcome, highest when anything could happen.',
    'It is another way to score how good a tree split is.',
    'You will meet it again as cross-entropy loss in neural nets.',
  ],
  [ // 13
    'A random forest grows many trees on resampled data and random feature subsets, then lets them vote.',
    'The samples each tree never saw (out-of-bag) give you free validation.',
    'With big data a 98/1/1 train/dev/test split is fine. Keep dev and test from the same source.',
  ],
  [ // 14
    'AdaBoost builds tiny one-question trees (stumps), one after another.',
    'Each new stump focuses on the samples the previous ones got wrong.',
    'Better stumps get a bigger say in the final vote.',
  ],
  [ // 15
    'Start with a simple guess, the average, then add small trees that predict the leftover errors.',
    'Each tree is scaled down by a learning rate, so many small steps beat one big jump.',
    'Keep adding trees until the errors stop shrinking.',
  ],
  [ // 16
    'The same leftover-chasing idea, now for yes/no outcomes.',
    'Predictions live in log-odds and turn into probabilities through the logistic function.',
    'Each tree nudges those probabilities closer to the true labels.',
  ],
  [ // 17
    'XGBoost builds its own trees, picking splits with a similarity score and gain.',
    'Gamma prunes weak branches. Lambda keeps leaf values modest.',
    'Speed plus regularisation is why it wins on tabular data.',
  ],
  [ // 18
    'An SVM finds the boundary with the widest possible gap between classes.',
    'A soft margin lets a few points sit on the wrong side so it does not overfit.',
    'Kernels lift data into higher dimensions where a straight cut works.',
  ],
  [ // 19
    'K-means drops K centres and keeps reassigning points until nothing moves.',
    'An elbow plot helps you choose K.',
    'Hierarchical clustering merges the most similar items step by step into a dendrogram.',
  ],
  [ // 20
    'PCA finds the directions where your data spreads out the most.',
    'The first component captures the most variation, the next captures the most of what is left.',
    'A scree plot shows how much each one explains. Loadings show which features drive it.',
  ],
  [ // 21
    't-SNE squashes high-dimensional data into a 2D map that keeps neighbours together.',
    'DBSCAN grows clusters out from dense points, so clusters can be any shape.',
    'Points that fit nowhere are labelled as outliers.',
  ],
  [ // 22
    'No video today, just eight questions on everything so far.',
    'Answer each one out loud, in your own words.',
    'Anything you cannot explain cleanly goes on your rewatch list.',
  ],

  // ── Phase 2 · Neural nets ────────────────────────
  [ // 23
    'A neural network is layers of neurons, each holding a number.',
    'Weights and biases decide how strongly one layer lights up the next.',
    'The digit reader is really one big function with about 13,000 knobs.',
  ],
  [ // 24
    'Learning means tuning those knobs to lower a cost function.',
    'Gradient descent does it in thousands of dimensions at once.',
    'Honest twist: the hidden layers do not learn the neat edges and loops you would hope for.',
  ],
  [ // 25
    'Backpropagation works out how much each weight contributed to the error.',
    'Each weight is nudged in proportion to its share of the blame, layer by layer, backwards.',
    'ReLU activations bend straight lines into flexible shapes the network can fit with.',
  ],
  [ // 26
    'Softmax turns raw output scores into probabilities that add up to one.',
    'ArgMax just picks the biggest score, but you cannot train with it.',
    'Cross-entropy scores those probabilities and punishes confident wrong answers hard.',
  ],
  [ // 27
    'Weight decay (L2) shrinks weights toward zero so the network stays simpler.',
    'Dropout randomly switches off neurons during training.',
    'No single neuron can become a crutch, so overfitting drops.',
  ],
  [ // 28
    'Normalising inputs makes the loss surface round instead of stretched, so training is faster.',
    'In deep networks gradients can vanish or explode. Careful initialisation helps.',
    'Stochastic gradient descent uses random samples to take fast, cheap steps.',
  ],
  [ // 29
    'Mini-batches sit between one sample and the whole dataset: noisy but fast.',
    'Adam combines momentum with a separate learning rate for every parameter.',
    'That is why it is the default optimiser almost everywhere.',
  ],
  [ // 30
    'Batch norm keeps each layer’s inputs in a steady range, so training is faster and less fragile.',
    'Transfer learning reuses a network already trained on a huge dataset.',
    'You then fine-tune it on your smaller one.',
  ],
  [ // 31
    'Before fixing anything, look at about 100 mistakes by hand and count the causes.',
    'Work on the biggest bucket first.',
    'If training data comes from a different source than real users, build dev and test sets from real-user data.',
  ],
  [ // 32
    'CNNs slide small filters across an image to spot edges and patterns.',
    'Pooling shrinks the image while keeping what matters.',
    'ResNets add skip connections so very deep networks can still learn.',
  ],
  [ // 33
    'An RNN reuses the same weights at every time step and passes a hidden state forward.',
    'That lets it read sequences of any length.',
    'The catch: over long sequences the gradients vanish or explode.',
  ],
  [ // 34
    'An LSTM adds a long-term memory lane next to the short-term one.',
    'Three gates decide what to forget, what to add and what to output.',
    'That keeps useful information alive across many steps.',
  ],
  [ // 35
    'Word embeddings place words in a space where similar meanings sit close together.',
    'Word2Vec learns them by predicting the words around each word.',
    'Negative sampling keeps that training cheap.',
  ],
  [ // 36
    'An encoder LSTM reads a sentence and squeezes it into one context vector.',
    'A decoder LSTM writes the translation one token at a time from that vector.',
    'Cramming a whole sentence into one vector is the bottleneck.',
  ],
  [ // 37
    'Attention lets the decoder look back at every encoder output, not one squeezed vector.',
    'Each input word is weighted by how relevant it is to the word being written.',
    'This idea is the seed of the transformer.',
  ],
  [ // 38
    'No video today, just eight questions on deep learning.',
    'Explain each one out loud as if teaching a friend.',
    'Rewatch whatever you stumble on.',
  ],

  // ── Phase 3 · Transformers ───────────────────────
  [ // 39
    'An LLM writes by predicting the next word, over and over.',
    'Text is split into tokens, and each token becomes a vector called an embedding.',
    'Those vectors flow through the transformer and get refined at every layer.',
  ],
  [ // 40
    'The final vector becomes a score for every possible next token.',
    'Softmax with a temperature turns those scores into probabilities.',
    'Then the attention chapter begins.',
  ],
  [ // 41
    'Queries ask, keys answer, and values carry the update.',
    'Masking stops each token from peeking at words that come later.',
    'Multi-head attention runs many of these side by side, each spotting different patterns.',
  ],
  [ // 42
    'The MLP blocks between attention layers seem to be where facts are stored.',
    'Example: how a model might “know” Michael Jordan plays basketball.',
    'Superposition lets a model pack in more features than it has dimensions.',
  ],
  [ // 43
    'StatQuest builds a transformer by hand, starting from word embeddings.',
    'Positional encoding uses sine waves so the model knows word order.',
    'Self-attention lets each word work out which other words matter to it.',
  ],
  [ // 44
    'Residual connections make the stack easier to train.',
    'Encoder-decoder attention links the input sentence to the output.',
    'The decoder produces the translation one token at a time.',
  ],
  [ // 45
    'This is the architecture behind ChatGPT.',
    'A decoder-only transformer uses masked self-attention over your prompt and its own answer.',
    'The same machinery reads your question and writes the reply.',
  ],
  [ // 46
    'Generation runs one token at a time, each new token fed back in.',
    'How it differs from the original encoder-decoder transformer, in training and in use.',
  ],
  [ // 47
    'Encoder-only models like BERT read the whole sentence at once, in both directions.',
    'They produce context-aware embeddings instead of generating text.',
    'Those embeddings power classification and the retrieval step in RAG.',
  ],

  // ── Phase 4 · How LLMs are built ─────────────────
  [ // 48
    'An LLM is really two files: a big parameters file and a small program that runs it.',
    'Pretraining compresses a huge slice of the internet into those parameters.',
    'Fine-tuning turns that document generator into a helpful assistant.',
  ],
  [ // 49
    'Scaling laws: more data and bigger models get predictably better.',
    'LLMs learn to use tools like browsers, calculators and code, and to handle images and audio.',
    'Open questions: slower “System 2” thinking and self-improvement.',
  ],
  [ // 50
    'Think of the LLM as the kernel of a new kind of operating system.',
    'The security side: jailbreaks, prompt injection and data poisoning.',
    'Why these attacks are so hard to stamp out.',
  ],
  [ // 51
    'Pretraining starts with a carefully filtered crawl of the web.',
    'Tokenisation turns that text into the sequences of symbols the network actually sees.',
  ],
  [ // 52
    'What the network computes inside, in plain terms.',
    'Inference samples the answer one token at a time.',
    'A look back at how GPT-2 was trained.',
  ],
  [ // 53
    'A base model is an internet document simulator, not an assistant.',
    'It can recite, autocomplete and even follow a few examples in the prompt.',
  ],
  [ // 54
    'Training on human-written conversations turns the base model into an assistant.',
    'First look at hallucinations: why models confidently make things up.',
  ],
  [ // 55
    'Letting the model search or use tools cuts down on hallucinations.',
    'Knowledge in the weights is fuzzy memory. The context window is working memory.',
    'Models need tokens to think, so step-by-step answers work better.',
  ],
  [ // 56
    'LLMs can ace olympiad problems yet fail to count letters or compare 9.11 and 9.9.',
    'Tokenisation explains a lot of it.',
    'Karpathy calls the result “Swiss cheese” intelligence.',
  ],
  [ // 57
    'Reinforcement learning is the third stage of training.',
    'It is like doing practice problems instead of reading worked examples.',
    'The model tries many solutions and reinforces the ones that reach the right answer.',
  ],
  [ // 58
    'DeepSeek-R1 and the rise of “thinking” models.',
    'Their long chains of thought come from RL, not from being taught.',
    'Like AlphaGo, RL can find strategies no human showed it.',
  ],
  [ // 59
    'For tasks with no checkable answer, RLHF trains a reward model to imitate human taste.',
    'It helps, but the model learns to game the reward model.',
    'So you can only run it for so long.',
  ],
  [ // 60
    'Where things are heading: multimodal models, agents and longer tasks.',
    'How to keep up, and where to find and run models yourself.',
    'A recap of the whole pipeline.',
  ],
  [ // 61
    'Start with supervised fine-tuning on good example answers.',
    'Collect human rankings of model outputs and train a reward model on them.',
    'Use reinforcement learning to push the LLM toward answers people prefer.',
  ],
  [ // 62
    'What actually matters when building LLMs: data, evaluation and systems, more than architecture.',
    'Pretraining is language modelling at enormous scale.',
    'How tokenisation works under the hood.',
  ],
  [ // 63
    'Evaluating pretrained models with perplexity and benchmarks.',
    'The long, messy pipeline for collecting and cleaning web-scale data.',
  ],
  [ // 64
    'Scaling laws predict loss from compute, data and model size.',
    'That tells you how to spend a training budget.',
    'What training a frontier model actually costs.',
  ],
  [ // 65
    'Supervised fine-tuning turns a language model into an assistant.',
    'Surprisingly little high-quality data goes a long way.',
  ],
  [ // 66
    'Preference tuning with RLHF, and the simpler DPO.',
    'How chat models get evaluated.',
    'Systems tricks, like low precision and operator fusion, that make training affordable.',
  ],
  [ // 67
    'No video today: walk through the whole LLM pipeline from memory.',
    'Answer the eight questions out loud.',
    'Anything shaky goes on your rewatch list.',
  ],

  // ── Phase 5 · AI engineering ─────────────────────
  [ // 68
    'RAG fetches relevant documents and hands them to the LLM before it answers.',
    'Answers stay current and can cite their sources.',
    'Cosine similarity measures how closely two embedding vectors point the same way.',
  ],
  [ // 69
    'Vector databases find the embeddings nearest to your query.',
    'They do it fast, without comparing against every single document.',
    'This is the retrieval engine under RAG.',
  ],
  [ // 70
    'Naive RAG breaks on bad chunking, weak retrieval and missing context.',
    'The fixes: smarter chunking, metadata, reranking and agent-style retrieval.',
  ],
  [ // 71
    'Lessons from real enterprise deployments, by a co-author of the original RAG paper.',
    'The system around the model matters more than the model.',
    'Specialise rather than generalise, and design for things going wrong.',
  ],
  [ // 72
    'RAG fetches documents on demand.',
    'CAG preloads the whole knowledge base into a long context and its KV cache.',
    'The trade-offs: accuracy, speed and how far each one scales.',
  ],
  [ // 73
    'Three ways to improve a model: better prompts, retrieval and fine-tuning.',
    'What each one costs and what each one actually fixes.',
    'Whether huge context windows make RAG unnecessary. Mostly, they do not.',
  ],
  [ // 74
    'Stanford CME295, lecture 5: what happens after pretraining.',
    'Why a raw model needs tuning to follow instructions and match human preferences.',
  ],
  [ // 75
    'Supervised fine-tuning on instruction data.',
    'What it teaches the model, and where it falls short.',
  ],
  [ // 76
    'Collecting preference data: which of two answers do people prefer?',
    'Training a reward model to predict those preferences.',
  ],
  [ // 77
    'Optimising against the reward with reinforcement learning, such as PPO.',
    'Simpler direct-preference methods, such as DPO, that skip the reward model.',
  ],
  [ // 78
    'Parameter-efficient tuning, so you do not update every weight.',
    'Practical choices when tuning a model for real use.',
  ],
  [ // 79
    'LoRA fine-tunes with tiny low-rank matrices instead of every weight, so it is cheap.',
    'The KV cache stores past keys and values so generation does not redo work.',
    'The cost: it eats GPU memory as the context grows.',
  ],
  [ // 80
    'An agent is an LLM that reasons, plans and calls tools in a loop.',
    'MCP is an open standard that lets agents plug into databases and APIs the same way every time.',
  ],
  [ // 81
    'Do not build agents for everything. A simple workflow is often better.',
    'Keep them simple, and think from the agent’s point of view.',
    'Under the hood an agent is just a model, some tools and a loop.',
  ],
  [ // 82
    'Why MCP exists when REST APIs already do.',
    'MCP servers describe their tools so models can discover and use them.',
    'When a plain API call is all you need.',
  ],
  [ // 83
    'Stanford CME295, lecture 7: from chatbots to agents.',
    'Grounding a model with retrieval, and giving it tools to act.',
  ],
  [ // 84
    'How tool calling works: the model writes a structured call.',
    'The system runs it and feeds the result back into the context.',
  ],
  [ // 85
    'Agent loops that think, act and observe, like ReAct.',
    'Planning, checking results and choosing the next step.',
  ],
  [ // 86
    'Scaling agents up: longer tasks and several agents working together.',
    'Protocols for connecting agents to tools.',
  ],
  [ // 87
    'What goes wrong with agents: safety, reliability and cost.',
    'Where the field is heading.',
  ],
  [ // 88
    'Stanford CME295, lecture 8: why judging free-form LLM output is hard.',
    'Human judgement is still the gold standard.',
  ],
  [ // 89
    'Automatic metrics and their blind spots.',
    'Why word-overlap scores miss what people actually care about.',
  ],
  [ // 90
    'LLM-as-a-judge: using a strong model to grade outputs.',
    'Watch for its biases: answer position, length and a taste for its own style.',
  ],
  [ // 91
    'Benchmarks for knowledge, reasoning, coding and agents.',
    'How to read leaderboards without being fooled by test data leaking into training.',
  ],
  [ // 92
    'Picking the right mix of evaluation methods for a real product.',
    'The open problems that remain.',
  ],
  [ // 93
    'Anthropic’s prompt engineers on what prompt engineering really is.',
    'It is mostly clear communication and a lot of iteration.',
    'Treat the model like a brilliant new hire who is missing context.',
  ],
  [ // 94
    'What makes someone good at it: reading outputs closely and anticipating edge cases.',
    'Be honest with the model about what you are actually trying to do.',
  ],
  [ // 95
    'Which tricks still help with modern models: role-play, examples, chain of thought.',
    'And which ones are just superstition.',
  ],
  [ // 96
    'How prompting has changed as models got smarter.',
    'Where it is going as models help write their own prompts.',
  ],
  [ // 97
    'Software 1.0 is code, 2.0 is neural network weights, 3.0 is prompts in plain English.',
    'LLMs behave like utilities, chip fabs and operating systems all at once.',
    'Their psychology is odd: superhuman in places, forgetful in others.',
  ],
  [ // 98
    'Build “Iron Man suits” with an autonomy slider, not fully autonomous robots.',
    'Keep the human check fast.',
    'Make your docs and tools easy for agents to read.',
  ],
  [ // 99
    'No video today: a mock interview on ML and deep learning.',
    'Answer out loud as if an interviewer were across the table.',
    'Aim for about two minutes per question, then rewatch anything you stumbled on.',
  ],
  [ // 100
    'The final episode: a system-design round on everything you have learned.',
    'Talk through each answer out loud, trade-offs included.',
    'Then go and do it for real with a friend.',
  ],
];
