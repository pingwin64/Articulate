export type TextDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface TextEntry {
  id: string;
  title: string;
  author?: string;
  words: string[];
  /** Number of texts user must complete in this category to unlock. 0 or undefined = always available */
  requiredReads?: number;
  /** Vocabulary difficulty level (1-15). Determines which user levels see this text. */
  difficulty?: number;
  /** Content access tier. 'free' = available to all users, 'premium' = premium users only */
  tier?: 'free' | 'premium';
  /** Reading difficulty tier for filtering and points multiplier */
  textDifficulty?: TextDifficulty;
}

import type { FeatherIconName } from '../../types/icons';

export interface Category {
  key: string;
  name: string;
  icon: FeatherIconName;
  /** @deprecated Use per-text difficulty instead. Kept for backward compatibility. */
  level?: 'beginner' | 'intermediate' | 'advanced';
  texts: TextEntry[];
}

function w(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

// ─── Story ────────────────────────────────────────────────────

const storyTexts: TextEntry[] = [
  // ─── Always Available (requiredReads: 0) ───
  {
    id: 'story-village',
    title: 'The Girl Who Loved to Read',
    textDifficulty: 'beginner',
    words: w(`Once upon a time, in a village by the sea, there lived a girl who loved to read. Every morning she would sit beneath the old oak tree and lose herself in stories. The words carried her to places she had never been, and she felt free.`),
  },
  {
    id: 'story-alice',
    title: 'Down the Rabbit-Hole',
    author: 'Lewis Carroll',
    textDifficulty: 'beginner',
    words: w(`Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice, "without pictures or conversations?" So she was considering in her own mind, as well as she could, for the hot day made her feel very sleepy and stupid, whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.`),
  },
  {
    id: 'story-tortoise',
    title: 'The Tortoise and the Hare',
    author: 'Aesop',
    textDifficulty: 'beginner',
    words: w(`A Hare was making fun of the Tortoise one day for being so slow. "Do you ever get anywhere?" he asked with a mocking laugh. "Yes," replied the Tortoise, "and I get there sooner than you think. I'll run you a race and prove it." The Hare was much amused at the idea of running a race with the Tortoise, but for the fun of the thing he agreed. The race began, and the Hare quickly darted almost out of sight. Soon he stopped and, to show his contempt for the Tortoise, lay down to have a nap.`),
  },
  // ─── Unlock after 2 reads ───
  {
    id: 'story-jungle',
    title: 'The Jungle Book Opening',
    author: 'Rudyard Kipling',
    requiredReads: 2,
    textDifficulty: 'intermediate',
    words: w(`It was seven o'clock of a very warm evening in the Seeonee hills when Father Wolf woke up from his day's rest, scratched himself, yawned, and spread out his paws one after the other to get rid of the sleepy feeling in their tips. Mother Wolf lay with her big gray nose dropped across her four tumbling, squealing cubs, and the moon shone into the mouth of the cave where they all lived.`),
  },
  {
    id: 'story-gift-magi',
    title: 'The Gift of the Magi',
    author: 'O. Henry',
    requiredReads: 2,
    textDifficulty: 'intermediate',
    words: w(`One dollar and eighty-seven cents. That was all. And sixty cents of it was in pennies. Pennies saved one and two at a time by bulldozing the grocer and the vegetable man and the butcher until one's cheeks burned with the silent imputation of parsimony that such close dealing implied. Three times Della counted it. One dollar and eighty-seven cents. And the next day would be Christmas.`),
  },
  // ─── Unlock after 4 reads ───
  {
    id: 'story-tell-tale',
    title: 'The Tell-Tale Heart',
    author: 'Edgar Allan Poe',
    requiredReads: 4,
    textDifficulty: 'advanced',
    words: w(`True! nervous, very, very dreadfully nervous I had been and am; but why will you say that I am mad? The disease had sharpened my senses, not destroyed, not dulled them. Above all was the sense of hearing acute. I heard all things in the heaven and in the earth. I heard many things in hell. How then am I mad? Hearken! and observe how healthily, how calmly, I can tell you the whole story.`),
  },
  {
    id: 'story-fox-grapes',
    title: 'The Fox and the Grapes',
    author: 'Aesop',
    requiredReads: 4,
    textDifficulty: 'beginner',
    words: w(`A Fox one day spied a beautiful bunch of ripe grapes hanging from a vine trained along the branches of a tree. The grapes seemed ready to burst with juice, and the Fox's mouth watered as he gazed longingly at them. The bunch hung from a high branch, and the Fox had to jump for it. The first time he jumped he missed it by a long way. So he walked off a short distance and took a running leap at it, only to fall short once more. Again and again he tried, but in vain. At last he turned away, saying: "I am sure they are sour."`),
  },
  // ─── Unlock after 6 reads ───
  {
    id: 'story-ant-grasshopper',
    title: 'The Ant and the Grasshopper',
    author: 'Aesop',
    requiredReads: 6,
    textDifficulty: 'beginner',
    words: w(`In a field one summer's day a Grasshopper was hopping about, chirping and singing to its heart's content. An Ant passed by, bearing along with great toil an ear of corn he was taking to the nest. "Why not come and chat with me," said the Grasshopper, "instead of toiling in that way?" "I am helping to lay up food for the winter," said the Ant, "and recommend you to do the same." "Why bother about winter?" said the Grasshopper. "We have plenty of food at present." But the Ant went on its way. When the winter came the Grasshopper had no food and found itself dying of hunger.`),
  },
  {
    id: 'story-lion-mouse',
    title: 'The Lion and the Mouse',
    author: 'Aesop',
    requiredReads: 6,
    textDifficulty: 'beginner',
    words: w(`Once when a Lion was asleep a little Mouse began running up and down upon him; this soon wakened the Lion, who placed his huge paw upon him, and opened his big jaws to swallow him. "Pardon, O King," cried the little Mouse, "forgive me this time, I shall never forget it: who knows but what I may be able to do you a turn some of these days?" The Lion was so tickled at the idea of the Mouse being able to help him, that he lifted up his paw and let him go. Some time after the Lion was caught in a trap. The Mouse heard his roar, and came and gnawed the rope with his teeth, setting the Lion free.`),
  },
  // ─── Unlock after 8 reads ───
  {
    id: 'story-wizard-oz',
    title: 'The Wonderful Wizard of Oz',
    author: 'L. Frank Baum',
    requiredReads: 8,
    textDifficulty: 'intermediate',
    words: w(`Dorothy lived in the midst of the great Kansas prairies, with Uncle Henry, who was a farmer, and Aunt Em, who was the farmer's wife. Their house was small, for the lumber to build it had to be carried by wagon many miles. There were four walls, a floor and a roof, which made one room; and this room contained a rusty looking cookstove, a cupboard for the dishes, a table, three or four chairs, and the beds.`),
  },
  {
    id: 'story-christmas-carol',
    title: 'A Christmas Carol',
    author: 'Charles Dickens',
    requiredReads: 8,
    textDifficulty: 'intermediate',
    words: w(`Marley was dead: to begin with. There is no doubt whatever about that. The register of his burial was signed by the clergyman, the clerk, the undertaker, and the chief mourner. Scrooge signed it: and Scrooge's name was good upon 'Change, for anything he chose to put his hand to. Old Marley was as dead as a door-nail. Scrooge knew he was dead? Of course he did. How could it be otherwise? Scrooge and he were partners for I don't know how many years.`),
  },
  // ─── Unlock after 10 reads ───
  {
    id: 'story-sherlock',
    title: 'A Study in Scarlet',
    author: 'Arthur Conan Doyle',
    requiredReads: 10,
    textDifficulty: 'intermediate',
    words: w(`In the year 1878 I took my degree of Doctor of Medicine of the University of London, and proceeded to Netley to go through the course prescribed for surgeons in the army. Having completed my studies there, I was duly attached to the Fifth Northumberland Fusiliers as Assistant Surgeon. The regiment was stationed in India at the time, and before I could join it, the second Afghan war had broken out.`),
  },
  {
    id: 'story-treasure-island',
    title: 'Treasure Island',
    author: 'Robert Louis Stevenson',
    requiredReads: 10,
    textDifficulty: 'advanced',
    words: w(`Squire Trelawney, Dr. Livesey, and the rest of these gentlemen having asked me to write down the whole particulars about Treasure Island, from the beginning to the end, keeping nothing back but the bearings of the island, and that only because there is still treasure not yet lifted, I take up my pen in the year of grace and go back to the time when my father kept the Admiral Benbow inn and the brown old seaman with the sabre cut first took up his lodging under our roof.`),
  },
  // ─── Unlock after 12 reads ───
  {
    id: 'story-grimm-cinderella',
    title: 'Cinderella',
    author: 'Brothers Grimm',
    requiredReads: 12,
    textDifficulty: 'intermediate',
    words: w(`The wife of a rich man fell sick, and as she felt that her end was drawing near, she called her only daughter to her bedside and said, "Dear child, be good and pious, and then the good God will always protect thee, and I will look down on thee from heaven and be near thee." Thereupon she closed her eyes and departed. Every day the maiden went out to her mother's grave, and wept, and she remained pious and good.`),
  },
  {
    id: 'story-ugly-duckling',
    title: 'The Ugly Duckling',
    author: 'Hans Christian Andersen',
    requiredReads: 12,
    textDifficulty: 'beginner',
    words: w(`It was lovely summer weather in the country, and the golden corn, the green oats, and the haystacks piled up in the meadows looked beautiful. The stork walking about on his long red legs chattered in the Egyptian language, which he had learnt from his mother. The cornfields and meadows were surrounded by large forests, in the midst of which were deep pools. It was, indeed, delightful to walk about in the country.`),
  },
  // ─── Unlock after 14 reads ───
  {
    id: 'story-rip-van-winkle',
    title: 'Rip Van Winkle',
    author: 'Washington Irving',
    requiredReads: 14,
    textDifficulty: 'intermediate',
    words: w(`Whoever has made a voyage up the Hudson must remember the Kaatskill mountains. They are a dismembered branch of the great Appalachian family, and are seen away to the west of the river, swelling up to a noble height, and lording it over the surrounding country. Every change of season, every change of weather, indeed, every hour of the day, produces some change in the magical hues and shapes of these mountains.`),
  },
  {
    id: 'story-legend-sleepy',
    title: 'The Legend of Sleepy Hollow',
    author: 'Washington Irving',
    requiredReads: 14,
    textDifficulty: 'advanced',
    words: w(`In the bosom of one of those spacious coves which indent the eastern shore of the Hudson, at that broad expansion of the river denominated by the ancient Dutch navigators the Tappan Zee, there lies a small market town which is generally known by the name of Tarry Town. Not far from this village, perhaps about two miles, there is a little valley among high hills, which is one of the quietest places in the whole world.`),
  },
  // ─── Unlock after 16 reads ───
  {
    id: 'story-anansi',
    title: 'Anansi and the Box of Stories',
    requiredReads: 16,
    textDifficulty: 'beginner',
    words: w(`Long ago, all stories belonged to Nyame, the Sky God, who kept them locked in a golden box beside his throne. No one on earth had stories to tell, and the nights were long and silent. Anansi the Spider looked up at the sky and said, "I will buy the stories from Nyame." Everyone laughed, for Anansi was small, but he was clever beyond measure. Nyame set a price that seemed impossible: bring me Onini the Python, Mmoboro the Hornets, and Osebo the Leopard. Anansi went to work. He cut a long bamboo pole and walked to the riverbank, muttering loudly, "He is longer than this pole. No, he is shorter. He is longer. He is shorter." Onini the Python, curious and proud, stretched himself along the pole to prove his length, and Anansi tied him fast. Next, Anansi filled a gourd with water and poured it over the hornets, offering them a dry gourd for shelter. When they flew inside, he sealed the opening. Finally, he dug a pit and covered it with branches. Osebo the Leopard fell in, and Anansi offered a bent tree branch as rescue, springing the leopard into a helpless tangle. Anansi carried all three to the Sky God. Nyame laughed with delight and gave Anansi the golden box. When Anansi opened it on earth, stories flew out in every direction, and from that day forward, people everywhere had tales to tell. That is why, to this day, the best stories in the world are called spider stories.`),
  },
  {
    id: 'story-crane-wife',
    title: 'The Crane Wife',
    requiredReads: 16,
    textDifficulty: 'intermediate',
    words: w(`In a small village at the edge of a snow-covered mountain, there lived a poor weaver named Karoku. One bitter winter evening, he found a crane caught in a hunter's trap, its white wing streaked with blood. Karoku freed the bird carefully, and it rose into the grey sky with a cry that echoed across the valley. That night, a young woman appeared at his door, shivering in the cold. She said her name was Tsuru, and she had nowhere to go. Karoku welcomed her, and in time they married. Though they were poor, they were content. One evening, Tsuru asked Karoku to build her a loom and promised to weave cloth that would change their fortune. She asked only one thing: that he never watch her while she worked. For three days and nights, the sound of the loom filled the house. When Tsuru emerged, pale and thin, she carried a bolt of cloth so beautiful it shimmered like moonlight on fresh snow. Karoku sold it for a great sum. Twice more Tsuru wove, and each time she grew weaker, and each time the cloth was more exquisite. Karoku's curiosity overwhelmed him. He slid open the door and saw not his wife but a slender crane, plucking feathers from her own body and weaving them into the cloth. Tsuru turned and looked at him with sad, knowing eyes. "I am the crane you saved," she whispered. "Now that you have seen me, I cannot stay." She transformed and flew into the winter sky, becoming a white speck against the clouds, and Karoku never saw her again.`),
  },
  {
    id: 'story-selfish-giant',
    title: 'The Selfish Giant',
    author: 'Oscar Wilde',
    requiredReads: 16,
    textDifficulty: 'intermediate',
    words: w(`Every afternoon, as they were coming from school, the children used to go and play in the Giant's garden. It was a large lovely garden, with soft green grass and beautiful flowers like stars. One day the Giant came back from visiting his friend and saw the children playing. "What are you doing here?" he cried in a very gruff voice, and the children ran away. "My own garden is my own garden," said the Giant. He built a high wall all round it and put up a notice board that read: Trespassers Will Be Prosecuted. Then the Spring came, and all over the country there were little blossoms and little birds. Only in the garden of the Selfish Giant it was still Winter. The birds did not care to sing in it as there were no children, and the trees forgot to blossom. Snow covered the grass and Frost painted the trees silver. "I cannot understand why the Spring is so late in coming," said the Giant, as he sat at the window and looked out at his cold white garden. But the Spring never came, nor the Summer. The Autumn gave golden fruit to every garden, but to the Giant's garden she gave none. "He is too selfish," she said. So it was always Winter there, and the North Wind, and the Hail, and the Frost, and the Snow danced about through the trees. One morning the Giant was lying awake in bed when he heard some lovely music. Through a little hole in the wall the children had crept in, and in every tree there was a little child, and the trees were so glad to have the children back that they had covered themselves with blossoms.`),
  },
];

// ─── Article ──────────────────────────────────────────────────

const articleTexts: TextEntry[] = [
  // ─── Always Available ───
  {
    id: 'article-reading',
    title: 'The Science of Reading Aloud',
    textDifficulty: 'beginner',
    words: w(`Reading aloud strengthens the connection between the eye and the brain. Studies show that speaking words activates deeper memory pathways. When we articulate each word, we process meaning more carefully. This simple practice can improve focus, vocabulary, and comprehension over time.`),
  },
  {
    id: 'article-self-reliance',
    title: 'Self-Reliance',
    author: 'Ralph Waldo Emerson',
    textDifficulty: 'advanced',
    words: w(`There is a time in every man's education when he arrives at the conviction that envy is ignorance; that imitation is suicide; that he must take himself for better, for worse, as his portion; that though the wide universe is full of good, no kernel of nourishing corn can come to him but through his toil bestowed on that plot of ground which is given to him to till. The power which resides in him is new in nature, and none but he knows what that is which he can do, nor does he know until he has tried.`),
  },
  {
    id: 'article-civil-disobedience',
    title: 'On the Duty of Civil Disobedience',
    author: 'Henry David Thoreau',
    textDifficulty: 'advanced',
    words: w(`I heartily accept the motto, "That government is best which governs least;" and I should like to see it acted up to more rapidly and systematically. Carried out, it finally amounts to this, which also I believe, — "That government is best which governs not at all;" and when men are prepared for it, that will be the kind of government which they will have. Government is at best but an expedient; but most governments are usually, and all governments are sometimes, inexpedient.`),
  },
  // ─── Unlock after 2 reads ───
  {
    id: 'article-walden',
    title: 'Walden',
    author: 'Henry David Thoreau',
    requiredReads: 2,
    textDifficulty: 'intermediate',
    words: w(`I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived. I did not wish to live what was not life, living is so dear; nor did I wish to practise resignation, unless it was quite necessary. I wanted to live deep and suck out all the marrow of life.`),
  },
  {
    id: 'article-nature',
    title: 'Nature',
    author: 'Ralph Waldo Emerson',
    requiredReads: 2,
    textDifficulty: 'intermediate',
    words: w(`To go into solitude, a man needs to retire as much from his chamber as from society. I am not solitary whilst I read and write, though nobody is with me. But if a man would be alone, let him look at the stars. The rays that come from those heavenly worlds will separate between him and what he touches. One might think the atmosphere was made transparent with this design, to give man, in the heavenly bodies, the perpetual presence of the sublime.`),
  },
  // ─── Unlock after 4 reads ───
  {
    id: 'article-franklin-virtue',
    title: 'The Way to Wealth',
    author: 'Benjamin Franklin',
    requiredReads: 4,
    textDifficulty: 'intermediate',
    words: w(`Friends, says he, and neighbours, the taxes are indeed very heavy, and if those laid on by the government were the only ones we had to pay, we might more easily discharge them; but we have many others, and much more grievous to some of us. We are taxed twice as much by our idleness, three times as much by our pride, and four times as much by our folly, and from these taxes the commissioners cannot ease or deliver us by allowing an abatement.`),
  },
  {
    id: 'article-twain-advice',
    title: 'Advice to Youth',
    author: 'Mark Twain',
    requiredReads: 4,
    textDifficulty: 'beginner',
    words: w(`Being told I would be expected to talk here, I inquired what sort of talk I ought to make. They said it should be something suitable to youth — something didactic, instructive, or something in the nature of good advice. Very well. I have a few things in my mind which I have often longed to say for the instruction of the young; for it is in one's tender early years that such things will best take root and be most enduring and most valuable.`),
  },
  // ─── Unlock after 6 reads ───
  {
    id: 'article-experience',
    title: 'Experience',
    author: 'Ralph Waldo Emerson',
    requiredReads: 6,
    textDifficulty: 'advanced',
    words: w(`Where do we find ourselves? In a series of which we do not know the extremes, and believe that it has none. We wake and find ourselves on a stair; there are stairs below us, which we seem to have ascended; there are stairs above us, many a one, which go upward and out of sight. Sleep lingers all our lifetime about our eyes, as night hovers all day in the boughs of the fir-tree.`),
  },
  {
    id: 'article-compensation',
    title: 'Compensation',
    author: 'Ralph Waldo Emerson',
    requiredReads: 6,
    textDifficulty: 'advanced',
    words: w(`Ever since I was a boy, I have wished to write a discourse on Compensation: for it seemed to me when very young, that on this subject life was ahead of theology, and the people knew more than the preachers taught. The documents too from which the doctrine is to be drawn, charmed my fancy by their endless variety, and lay always before me, even in sleep; for they are the tools in our hands, the bread in our basket.`),
  },
  // ─── Unlock after 8 reads ───
  {
    id: 'article-friendship',
    title: 'Friendship',
    author: 'Ralph Waldo Emerson',
    requiredReads: 8,
    textDifficulty: 'intermediate',
    words: w(`We have a great deal more kindness than is ever spoken. Maugre all the selfishness that chills like east winds the world, the whole human family is bathed with an element of love like a fine ether. How many persons we meet in houses, whom we scarcely speak to, whom yet we honor, and who honor us! How many we see in the street, or sit with in church, whom, though silently, we warmly rejoice to be with!`),
  },
  {
    id: 'article-essay-man',
    title: 'An Essay on Man',
    author: 'Alexander Pope',
    requiredReads: 8,
    textDifficulty: 'advanced',
    words: w(`Know then thyself, presume not God to scan; the proper study of mankind is man. Placed on this isthmus of a middle state, a being darkly wise, and rudely great: with too much knowledge for the sceptic side, with too much weakness for the Stoic's pride, he hangs between; in doubt to act, or rest, in doubt to deem himself a God, or Beast, in doubt his mind or body to prefer, born but to die, and reasoning but to err.`),
  },
  // ─── Unlock after 10 reads ───
  {
    id: 'article-rights-man',
    title: 'Rights of Man',
    author: 'Thomas Paine',
    requiredReads: 10,
    textDifficulty: 'intermediate',
    words: w(`When it shall be said in any country in the world, my poor are happy; neither ignorance nor distress is to be found among them; my jails are empty of prisoners, my streets of beggars; the aged are not in want, the taxes are not oppressive; the rational world is my friend, because I am a friend of its happiness: when these things can be said, then may that country boast of its constitution and its government.`),
  },
  {
    id: 'article-common-sense',
    title: 'Common Sense',
    author: 'Thomas Paine',
    requiredReads: 10,
    textDifficulty: 'intermediate',
    words: w(`Society in every state is a blessing, but government even in its best state is but a necessary evil; in its worst state an intolerable one; for when we suffer, or are exposed to the same miseries by a government, which we might expect in a country without government, our calamity is heightened by reflecting that we furnish the means by which we suffer.`),
  },
  // ─── Unlock after 12 reads ───
  {
    id: 'article-education',
    title: 'A Treatise on Education',
    author: 'John Locke',
    requiredReads: 12,
    textDifficulty: 'advanced',
    words: w(`The well educating of children is so much the duty and concern of parents, and the welfare and prosperity of the nation so much depends on it, that I would have every one lay it seriously to heart; and after having well examined and distinguished what fancy, custom, or reason advises in the case, set his helping hand to promote every where that way of training up youth.`),
  },
  {
    id: 'article-poor-richard',
    title: 'Poor Richard\'s Almanack',
    author: 'Benjamin Franklin',
    requiredReads: 12,
    textDifficulty: 'beginner',
    words: w(`Early to bed and early to rise, makes a man healthy, wealthy and wise. He that lies down with dogs, shall rise up with fleas. Necessity never made a good bargain. Three may keep a secret, if two of them are dead. Fish and visitors stink after three days. An investment in knowledge pays the best interest. Well done is better than well said. Tell me and I forget, teach me and I may remember, involve me and I learn.`),
  },
  // ─── Unlock after 14 reads ───
  {
    id: 'article-leisure',
    title: 'In Praise of Idleness',
    author: 'Bertrand Russell',
    requiredReads: 14,
    textDifficulty: 'intermediate',
    words: w(`Like most of my generation, I was brought up on the saying: "Satan finds some mischief for idle hands to do." Being a highly virtuous child, I believed all that I was told, and acquired a conscience which has kept me working hard down to the present moment. But although my conscience has controlled my actions, my opinions have undergone a revolution. I think that there is far too much work done in the world.`),
  },
  {
    id: 'article-simplicity',
    title: 'On Simplicity',
    author: 'William Penn',
    requiredReads: 14,
    textDifficulty: 'intermediate',
    words: w(`We are apt to love praise, but not to deserve it. But if we would deserve it, we must love virtue more than that. The truest end of life is to know the life that never ends. Sense shines with a double lustre when it is set in humility. An able yet humble man is a jewel worth a kingdom. They have a right to censure that have a heart to help. The rest is cruelty, not justice.`),
  },
  // ─── Unlock after 16 reads ───
  {
    id: 'article-wollstonecraft',
    title: 'A Vindication of the Rights of Woman',
    author: 'Mary Wollstonecraft',
    requiredReads: 16,
    textDifficulty: 'intermediate',
    words: w(`I do not wish women to have power over men, but over themselves. It is vain to expect virtue from women till they are in some degree independent of men. Taught from infancy that beauty is woman's sceptre, the mind shapes itself to the body, and roaming round its gilt cage, only seeks to adorn its prison. The being who patiently endures injustice, and silently bears insults, will soon become unjust, or unable to discern right from wrong. Strengthen the female mind by enlarging it, and there will be an end to blind obedience; but as blind obedience is ever sought for by power, tyrants and sensualists are in the right when they endeavour to keep women in the dark, because the former only want slaves, and the latter a plaything. I do earnestly wish to point out in what true dignity and human happiness consists. I wish to persuade women to endeavour to acquire strength, both of mind and body, and to convince them that the soft phrases, susceptibility of heart, delicacy of sentiment, and refinement of taste, are almost synonymous with epithets of weakness.`),
  },
  {
    id: 'article-dubois',
    title: 'The Souls of Black Folk',
    author: 'W. E. B. Du Bois',
    requiredReads: 16,
    textDifficulty: 'advanced',
    words: w(`Between me and the other world there is ever an unasked question: How does it feel to be a problem? One ever feels his twoness — two souls, two thoughts, two unreconciled strivings; two warring ideals in one body, whose dogged strength alone keeps it from being torn asunder. The history of this striving, this longing to attain self-conscious manhood, to merge a double self into a better and truer self, is the tale of a people who have known neither rest nor peace. In those sombre forests of striving, the soul was finding itself, and dimly felt its power. And yet the dawn was gray, and in the east the shadows deepened. He would not bleach his soul in a flood of white Americanism, for he knows that the richest and best heritage of humanity is not the possession of any one race. He simply wishes to make it possible to be both — without being cursed and spit upon by his fellows, without having the doors of Opportunity closed roughly in his face.`),
  },
  {
    id: 'article-mill',
    title: 'On Liberty',
    author: 'John Stuart Mill',
    requiredReads: 16,
    textDifficulty: 'intermediate',
    words: w(`The object of this essay is to assert one very simple principle: that the sole end for which mankind are warranted in interfering with the liberty of action of any of their number, is self-protection. Over himself, over his own body and mind, the individual is sovereign. The only freedom which deserves the name, is that of pursuing our own good in our own way, so long as we do not attempt to deprive others of theirs. If all mankind minus one were of one opinion, and only one person were of the contrary opinion, mankind would be no more justified in silencing that one person, than he, if he had the power, would be justified in silencing mankind. The peculiar evil of silencing the expression of an opinion is that it is robbing the human race; those who dissent from the opinion, still more than those who hold it. We can never be sure that the opinion we are endeavouring to stifle is a false opinion; and if we were sure, stifling it would be an evil still.`),
  },
];

// ─── Speech ───────────────────────────────────────────────────

const speechTexts: TextEntry[] = [
  // ─── Always Available ───
  {
    id: 'speech-declaration',
    title: 'Declaration of Independence',
    author: 'Thomas Jefferson',
    textDifficulty: 'beginner',
    words: w(`We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.`),
  },
  {
    id: 'speech-gettysburg',
    title: 'Gettysburg Address',
    author: 'Abraham Lincoln',
    textDifficulty: 'intermediate',
    words: w(`Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this.`),
  },
  {
    id: 'speech-fdr',
    title: 'First Inaugural Address',
    author: 'Franklin D. Roosevelt',
    textDifficulty: 'intermediate',
    words: w(`This is preeminently the time to speak the truth, the whole truth, frankly and boldly. Nor need we shrink from honestly facing conditions in our country today. This great Nation will endure as it has endured, will revive and will prosper. So, first of all, let me assert my firm belief that the only thing we have to fear is fear itself — nameless, unreasoning, unjustified terror which paralyzes needed efforts to convert retreat into advance.`),
  },
  // ─── Unlock after 2 reads ───
  {
    id: 'speech-liberty',
    title: 'Give Me Liberty, or Give Me Death!',
    author: 'Patrick Henry',
    requiredReads: 2,
    textDifficulty: 'beginner',
    words: w(`Is life so dear, or peace so sweet, as to be purchased at the price of chains and slavery? Forbid it, Almighty God! I know not what course others may take; but as for me, give me liberty, or give me death!`),
  },
  {
    id: 'speech-mlk-dream',
    title: 'I Have a Dream',
    author: 'Martin Luther King Jr.',
    requiredReads: 2,
    textDifficulty: 'beginner',
    words: w(`I say to you today, my friends, so even though we face the difficulties of today and tomorrow, I still have a dream. It is a dream deeply rooted in the American dream. I have a dream that one day this nation will rise up and live out the true meaning of its creed: "We hold these truths to be self-evident, that all men are created equal." I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.`),
  },
  // ─── Unlock after 4 reads ───
  {
    id: 'speech-churchill-fight',
    title: 'We Shall Fight on the Beaches',
    author: 'Winston Churchill',
    requiredReads: 4,
    textDifficulty: 'intermediate',
    words: w(`We shall go on to the end, we shall fight in France, we shall fight on the seas and oceans, we shall fight with growing confidence and growing strength in the air, we shall defend our Island, whatever the cost may be, we shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields and in the streets, we shall fight in the hills; we shall never surrender.`),
  },
  {
    id: 'speech-jfk-moon',
    title: 'We Choose to Go to the Moon',
    author: 'John F. Kennedy',
    requiredReads: 4,
    textDifficulty: 'intermediate',
    words: w(`We choose to go to the moon in this decade and do the other things, not because they are easy, but because they are hard, because that goal will serve to organize and measure the best of our energies and skills, because that challenge is one that we are willing to accept, one we are unwilling to postpone, and one which we intend to win, and the others, too.`),
  },
  // ─── Unlock after 6 reads ───
  {
    id: 'speech-jfk-inaugural',
    title: 'Inaugural Address',
    author: 'John F. Kennedy',
    requiredReads: 6,
    textDifficulty: 'intermediate',
    words: w(`And so, my fellow Americans: ask not what your country can do for you — ask what you can do for your country. My fellow citizens of the world: ask not what America will do for you, but what together we can do for the freedom of man. Finally, whether you are citizens of America or citizens of the world, ask of us here the same high standards of strength and sacrifice which we ask of you.`),
  },
  {
    id: 'speech-churchill-finest',
    title: 'Their Finest Hour',
    author: 'Winston Churchill',
    requiredReads: 6,
    textDifficulty: 'advanced',
    words: w(`What General Weygand called the Battle of France is over. I expect that the Battle of Britain is about to begin. Upon this battle depends the survival of Christian civilization. Upon it depends our own British life, and the long continuity of our institutions and our Empire. The whole fury and might of the enemy must very soon be turned on us. Hitler knows that he will have to break us in this Island or lose the war.`),
  },
  // ─── Unlock after 8 reads ───
  {
    id: 'speech-lincoln-second',
    title: 'Second Inaugural Address',
    author: 'Abraham Lincoln',
    requiredReads: 8,
    textDifficulty: 'intermediate',
    words: w(`With malice toward none, with charity for all, with firmness in the right as God gives us to see the right, let us strive on to finish the work we are in, to bind up the nation's wounds, to care for him who shall have borne the battle and for his widow and his orphan, to do all which may achieve and cherish a just and lasting peace among ourselves and with all nations.`),
  },
  {
    id: 'speech-reagan-challenger',
    title: 'Challenger Disaster Address',
    author: 'Ronald Reagan',
    requiredReads: 8,
    textDifficulty: 'beginner',
    words: w(`The crew of the Space Shuttle Challenger honored us by the manner in which they lived their lives. We will never forget them, nor the last time we saw them, this morning, as they prepared for their journey and waved goodbye and slipped the surly bonds of earth to touch the face of God.`),
  },
  // ─── Unlock after 10 reads ───
  {
    id: 'speech-mandela-inauguration',
    title: 'Inauguration Speech',
    author: 'Nelson Mandela',
    requiredReads: 10,
    textDifficulty: 'intermediate',
    words: w(`We have, at last, achieved our political emancipation. We pledge ourselves to liberate all our people from the continuing bondage of poverty, deprivation, suffering, gender and other discrimination. Never, never and never again shall it be that this beautiful land will again experience the oppression of one by another. The sun shall never set on so glorious a human achievement. Let freedom reign. God bless Africa!`),
  },
  {
    id: 'speech-teddy-arena',
    title: 'The Man in the Arena',
    author: 'Theodore Roosevelt',
    requiredReads: 10,
    textDifficulty: 'intermediate',
    words: w(`It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood; who strives valiantly; who errs, who comes short again and again, because there is no effort without error and shortcoming.`),
  },
  // ─── Unlock after 12 reads ───
  {
    id: 'speech-washington-farewell',
    title: 'Farewell Address',
    author: 'George Washington',
    requiredReads: 12,
    textDifficulty: 'advanced',
    words: w(`The unity of government which constitutes you one people is also now dear to you. It is justly so, for it is a main pillar in the edifice of your real independence, the support of your tranquility at home, your peace abroad; of your safety; of your prosperity; of that very liberty which you so highly prize.`),
  },
  {
    id: 'speech-pericles',
    title: 'Funeral Oration',
    author: 'Pericles',
    requiredReads: 12,
    textDifficulty: 'advanced',
    words: w(`Our constitution does not copy the laws of neighbouring states; we are rather a pattern to others than imitators ourselves. Its administration favours the many instead of the few; this is why it is called a democracy. If we look to the laws, they afford equal justice to all in their private differences.`),
  },
  // ─── Unlock after 14 reads ───
  {
    id: 'speech-cicero',
    title: 'Against Catiline',
    author: 'Marcus Tullius Cicero',
    requiredReads: 14,
    textDifficulty: 'advanced',
    words: w(`When, O Catiline, do you mean to cease abusing our patience? How long is that madness of yours still to mock us? When is there to be an end of that unbridled audacity of yours, swaggering about as it does now? Do not the nightly guards placed on the Palatine Hill move you? Does not the alarm of the people move you?`),
  },
  {
    id: 'speech-demosthenes',
    title: 'First Philippic',
    author: 'Demosthenes',
    requiredReads: 14,
    textDifficulty: 'advanced',
    words: w(`If you, Athenians, will now at length be persuaded to think as I advise, and resolve, each of you, laying aside every other consideration, to render such service as the state requires and as his abilities permit, without reserve; the wealthy to contribute, the able-bodied to enlist; in a word, if you will consent to become your own masters, and cease each expecting to do nothing himself while his neighbour does everything for him.`),
  },
  // ─── Unlock after 16 reads ───
  {
    id: 'speech-sojourner',
    title: 'Address to the Women\'s Convention',
    author: 'Sojourner Truth',
    requiredReads: 16,
    textDifficulty: 'beginner',
    words: w(`Well, children, where there is so much racket there must be something out of kilter. I think that between the people of the North and the South, something is not right. That man over there says that women need to be helped into carriages and lifted over ditches, and to have the best place everywhere. Nobody ever helps me into carriages, or over mud puddles, or gives me any best place! And look at me! Look at my arm! I have ploughed and planted, and gathered into barns, and no man could head me! I could work as much and eat as much as a man — when I could get it — and bear the lash as well! I have borne children, and seen most of them sold off, and when I cried out with my mother's grief, none but the Almighty heard me! And now they say women cannot have as much rights as men, because they are not as intelligent. What has intellect to do with rights? If my cup won't hold but a pint, and yours holds a quart, wouldn't you be mean not to let me have my little half measure full?`),
  },
  {
    id: 'speech-seneca-falls',
    title: 'Declaration of Sentiments',
    author: 'Elizabeth Cady Stanton',
    requiredReads: 16,
    textDifficulty: 'intermediate',
    words: w(`We hold these truths to be self-evident: that all men and women are created equal; that they are endowed by their Creator with certain inalienable rights; that among these are life, liberty, and the pursuit of happiness; that to secure these rights governments are instituted, deriving their just powers from the consent of the governed. The history of mankind is a history of repeated injuries and usurpations on the part of man toward woman, having in direct object the establishment of an absolute tyranny over her. To prove this, let facts be submitted to a candid world. He has never permitted her to exercise her inalienable right to the elective franchise. He has compelled her to submit to laws, in the formation of which she had no voice. He has made her, if married, in the eye of the law, civilly dead. He has monopolized nearly all the profitable employments, and from those she is permitted to follow, she receives but a scanty remuneration.`),
  },
  {
    id: 'speech-chief-joseph',
    title: 'Surrender Speech',
    author: 'Chief Joseph',
    requiredReads: 16,
    textDifficulty: 'beginner',
    words: w(`Tell General Howard I know his heart. What he told me before, I have it in my heart. I am tired of fighting. Our chiefs are gone. The old men are all gone. It is the young men who say yes or no. The one who led the young men is gone. It is cold, and we have no blankets. The little children are freezing. My people, some of them, have run away to the hills and have no blankets, no food. No one knows where they are — perhaps freezing. I want to have time to look for my children, and see how many of them I can find. Maybe I shall find them among the fallen. Hear me, my chiefs! I am tired. My heart is sick and sad. From where the sun now stands, I will fight no more forever.`),
  },
];

// ─── Philosophy ───────────────────────────────────────────────

const philosophyTexts: TextEntry[] = [
  // ─── Always Available ───
  {
    id: 'philosophy-wisdom',
    title: 'Ancient Wisdom',
    textDifficulty: 'beginner',
    words: w(`The unexamined life is not worth living. We are what we repeatedly do. Excellence, then, is not an act, but a habit. The only true wisdom is in knowing you know nothing. Happiness depends upon ourselves. It is the mark of an educated mind to be able to entertain a thought without accepting it.`),
  },
  {
    id: 'philosophy-meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    textDifficulty: 'intermediate',
    words: w(`When you arise in the morning, think of what a precious privilege it is to be alive — to breathe, to think, to enjoy, to love. Dwell on the beauty of life. Watch the stars, and see yourself running with them. Very little is needed to make a happy life; it is all within yourself, in your way of thinking. The happiness of your life depends upon the quality of your thoughts: therefore, guard accordingly, and take care that you entertain no notions unsuitable to virtue and reasonable nature.`),
  },
  {
    id: 'philosophy-seneca',
    title: 'On the Shortness of Life',
    author: 'Seneca',
    textDifficulty: 'intermediate',
    words: w(`It is not that we have a short time to live, but that we waste a great deal of it. Life is long enough, and a sufficiently generous amount has been given to us for the highest achievements if it were all well invested. But when it is wasted in heedless luxury and spent on no good activity, we are forced at last by death's final constraint to realize that it has passed away before we knew it was passing.`),
  },
  // ─── Unlock after 2 reads ───
  {
    id: 'philosophy-epictetus',
    title: 'Enchiridion',
    author: 'Epictetus',
    requiredReads: 2,
    textDifficulty: 'intermediate',
    words: w(`Some things are in our control and others not. Things in our control are opinion, pursuit, desire, aversion, and, in a word, whatever are our own actions. Things not in our control are body, property, reputation, command, and, in one word, whatever are not our own actions. Make the best use of what is in your power, and take the rest as it happens.`),
  },
  {
    id: 'philosophy-seneca-letters',
    title: 'Letters from a Stoic',
    author: 'Seneca',
    requiredReads: 2,
    textDifficulty: 'intermediate',
    words: w(`True happiness is to enjoy the present, without anxious dependence upon the future, not to amuse ourselves with either hopes or fears but to rest satisfied with what we have, which is sufficient, for he who is so wants nothing. The greatest blessings of mankind are within us and within our reach. A wise man is content with his lot, whatever it may be, without wishing for what he has not.`),
  },
  // ─── Unlock after 4 reads ───
  {
    id: 'philosophy-plato-allegory',
    title: 'Allegory of the Cave',
    author: 'Plato',
    requiredReads: 4,
    textDifficulty: 'advanced',
    words: w(`Imagine mankind as dwelling in an underground cave. They have been there from childhood, with necks and legs fettered, so that they remain in the same place and can only see what is in front of them. Light reaches them from a fire burning behind them. They see only shadows on the wall. One day, a prisoner is freed and compelled to turn toward the light, and he is dazzled and distressed by the glare.`),
  },
  {
    id: 'philosophy-aristotle',
    title: 'Nicomachean Ethics',
    author: 'Aristotle',
    requiredReads: 4,
    textDifficulty: 'advanced',
    words: w(`Every art and every inquiry, and similarly every action and pursuit, is thought to aim at some good; and for this reason the good has rightly been declared to be that at which all things aim. If there is some end of the things we do, which we desire for its own sake, clearly this must be the chief good. Will not the knowledge of it, then, have a great influence on life?`),
  },
  // ─── Unlock after 6 reads ───
  {
    id: 'philosophy-descartes',
    title: 'Discourse on Method',
    author: 'René Descartes',
    requiredReads: 6,
    textDifficulty: 'advanced',
    words: w(`Good sense is, of all things among men, the most equally distributed; for every one thinks himself so abundantly provided with it, that those even who are the most difficult to satisfy in everything else, do not usually desire a larger measure of this quality than they already possess. I think, therefore I am, was so certain and so assured that all the most extravagant suppositions brought forward by the skeptics were incapable of shaking it.`),
  },
  {
    id: 'philosophy-kant',
    title: 'Critique of Pure Reason',
    author: 'Immanuel Kant',
    requiredReads: 6,
    textDifficulty: 'advanced',
    words: w(`Two things fill the mind with ever new and increasing admiration and awe, the more often and steadily we reflect upon them: the starry heavens above me and the moral law within me. I do not seek or conjecture either of them as if they were veiled obscurities or extravagances beyond the horizon of my vision; I see them before me and connect them immediately with the consciousness of my existence.`),
  },
  // ─── Unlock after 8 reads ───
  {
    id: 'philosophy-nietzsche',
    title: 'Thus Spoke Zarathustra',
    author: 'Friedrich Nietzsche',
    requiredReads: 8,
    textDifficulty: 'advanced',
    words: w(`I teach you the overman. Man is something that shall be overcome. What have you done to overcome him? All beings so far have created something beyond themselves; and do you want to be the ebb of this great flood and even go back to the beasts rather than overcome man? What is the ape to man? A laughingstock or a painful embarrassment. And man shall be just that for the overman.`),
  },
  {
    id: 'philosophy-schopenhauer',
    title: 'The World as Will',
    author: 'Arthur Schopenhauer',
    requiredReads: 8,
    textDifficulty: 'advanced',
    words: w(`The world is my idea: this is a truth which holds good for everything that lives and knows, though man alone can bring it into reflective and abstract consciousness. If he really does this, he has attained to philosophical wisdom. It then becomes clear and certain to him that what he knows is not a sun and an earth, but only an eye that sees a sun, a hand that feels an earth.`),
  },
  // ─── Unlock after 10 reads ───
  {
    id: 'philosophy-kierkegaard',
    title: 'Either/Or',
    author: 'Søren Kierkegaard',
    requiredReads: 10,
    textDifficulty: 'advanced',
    words: w(`What is a poet? An unhappy person who conceals profound anguish in his heart but whose lips are so formed that as sighs and cries pass over them they sound like beautiful music. Life can only be understood backwards; but it must be lived forwards. Anxiety is the dizziness of freedom. The most common form of despair is not being who you are.`),
  },
  {
    id: 'philosophy-spinoza',
    title: 'Ethics',
    author: 'Baruch Spinoza',
    requiredReads: 10,
    textDifficulty: 'advanced',
    words: w(`I shall consider human actions and desires in exactly the same manner as though I were concerned with lines, planes, and solids. The highest activity a human being can attain is learning for understanding, because to understand is to be free. Peace is not the absence of war, it is a virtue, a state of mind, a disposition for benevolence, confidence, justice.`),
  },
  // ─── Unlock after 12 reads ───
  {
    id: 'philosophy-confucius',
    title: 'Analects',
    author: 'Confucius',
    requiredReads: 12,
    textDifficulty: 'intermediate',
    words: w(`It does not matter how slowly you go as long as you do not stop. The man who moves a mountain begins by carrying away small stones. Real knowledge is to know the extent of one's ignorance. When it is obvious that the goals cannot be reached, don't adjust the goals, adjust the action steps. Our greatest glory is not in never falling, but in rising every time we fall.`),
  },
  {
    id: 'philosophy-pascal',
    title: 'Pensées',
    author: 'Blaise Pascal',
    requiredReads: 12,
    textDifficulty: 'advanced',
    words: w(`Man is but a reed, the most feeble thing in nature, but he is a thinking reed. The entire universe need not arm itself to crush him. A vapor, a drop of water suffices to kill him. But if the universe were to crush him, man would still be more noble than that which killed him, because he knows that he dies and the advantage which the universe has over him; the universe knows nothing of this.`),
  },
  // ─── Unlock after 14 reads ───
  {
    id: 'philosophy-hegel',
    title: 'Phenomenology of Spirit',
    author: 'Georg Wilhelm Friedrich Hegel',
    requiredReads: 14,
    textDifficulty: 'advanced',
    words: w(`The True is the whole. But the whole is nothing other than the essence consummating itself through its development. Of the Absolute it must be said that it is essentially a result, that only in the end is it what it truly is; and that precisely in this consists its nature, namely, to be actual, subject, the spontaneous becoming of itself.`),
  },
  {
    id: 'philosophy-wittgenstein',
    title: 'Tractatus Logico-Philosophicus',
    author: 'Ludwig Wittgenstein',
    requiredReads: 14,
    textDifficulty: 'advanced',
    words: w(`The world is all that is the case. The world is the totality of facts, not of things. What we cannot speak about we must pass over in silence. The limits of my language mean the limits of my world. Whereof one cannot speak, thereof one must be silent. If people never did silly things nothing intelligent would ever get done.`),
  },
  // ─── Unlock after 16 reads ───
  {
    id: 'philosophy-beauvoir',
    title: 'The Ethics of Ambiguity',
    author: 'Simone de Beauvoir',
    requiredReads: 16,
    textDifficulty: 'advanced',
    words: w(`To exist is to make oneself a lack of being; it is to cast oneself into the world. Man makes himself a lack, but he can deny the lack as lack and affirm himself as a positive existence. To declare that existence is absurd is to deny that it can ever be given a meaning; to say that it is ambiguous is to assert that its meaning is never fixed, that it must be constantly won. Freedom is the source from which all significations and all values spring. It is the original condition of all justification of existence. One's life has value so long as one attributes value to the life of others, by means of love, friendship, indignation, and compassion. The individual is not a given but a perpetual becoming. To exist authentically is to face the openness of the future without seeking refuge in the false security of absolute answers. We must assume our acts and take responsibility for the world we are creating, not as isolated beings but as participants in a shared human endeavor.`),
  },
  {
    id: 'philosophy-laotzu',
    title: 'Tao Te Ching',
    author: 'Lao Tzu',
    requiredReads: 16,
    textDifficulty: 'beginner',
    words: w(`The Tao that can be told is not the eternal Tao. The name that can be named is not the eternal name. The nameless is the beginning of heaven and earth. The named is the mother of ten thousand things. The soft overcomes the hard. The slow overcomes the fast. A tree that is unbending is easily broken. The wise are not learned; the learned are not wise. When I let go of what I am, I become what I might be. Nature does not hurry, yet everything is accomplished. The journey of a thousand miles begins with a single step. He who knows others is wise; he who knows himself is enlightened. To the mind that is still, the whole universe surrenders. In the pursuit of learning, every day something is acquired. In the pursuit of Tao, every day something is dropped. Silence is a source of great strength. Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.`),
  },
  {
    id: 'philosophy-epictetus',
    title: 'The Enchiridion',
    author: 'Epictetus',
    requiredReads: 16,
    textDifficulty: 'intermediate',
    words: w(`Some things are in our control and others not. Things in our control are opinion, pursuit, desire, aversion, and, in a word, whatever are our own actions. Things not in our control are body, property, reputation, command, and, in one word, whatever are not our own actions. The things in our control are by nature free, unrestrained, unhindered; but those not in our control are weak, slavish, restrained, belonging to others. Remember, then, that if you suppose that things which are slavish by nature are also free, and that what belongs to others is your own, then you will be hindered. You will lament, you will be disturbed, and you will find fault both with gods and men. But if you suppose that only to be your own which is your own, and what belongs to others such as it really is, then no one will ever compel you or restrain you. Make it your study then to confront every harsh impression with the words: you are but an impression, and not at all the thing you seem to be.`),
  },
];

// ─── Science ──────────────────────────────────────────────────

const scienceTexts: TextEntry[] = [
  // ─── Always Available ───
  {
    id: 'science-curie',
    title: 'On Curiosity and Discovery',
    textDifficulty: 'beginner',
    words: w(`Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less. A scientist in a laboratory is not a mere technician: they are a child placed before natural phenomena which impress them like a fairy tale. We must believe that we are gifted for something, and that this thing, at whatever cost, must be attained.`),
  },
  {
    id: 'science-origin',
    title: 'On the Origin of Species',
    author: 'Charles Darwin',
    textDifficulty: 'advanced',
    words: w(`When on board H.M.S. Beagle, as naturalist, I was much struck with certain facts in the distribution of the inhabitants of South America, and in the geological relations of the present to the past inhabitants of that continent. These facts seemed to me to throw some light on the origin of species — that mystery of mysteries, as it has been called by one of our greatest philosophers. There is grandeur in this view of life, with its several powers, having been originally breathed into a few forms or into one.`),
  },
  {
    id: 'science-eureka',
    title: 'Eureka: A Prose Poem',
    author: 'Edgar Allan Poe',
    textDifficulty: 'advanced',
    words: w(`I design to speak of the Physical, Metaphysical and Mathematical — of the Material and Spiritual Universe: of its Essence, its Origin, its Creation, its Present Condition and its Destiny. In the Original Unity of the First Thing lies the Secondary Cause of All Things, with the Germ of their Inevitable Annihilation. The Universe is a plot of God.`),
  },
  // ─── Unlock after 2 reads ───
  {
    id: 'science-feynman',
    title: 'The Pleasure of Finding Things Out',
    author: 'Richard Feynman',
    requiredReads: 2,
    textDifficulty: 'beginner',
    words: w(`The first principle is that you must not fool yourself — and you are the easiest person to fool. I learned very early the difference between knowing the name of something and knowing something. Fall in love with some activity, and do it! Nobody ever figures out what life is all about, and it doesn't matter. The highest forms of understanding we can achieve are laughter and human compassion.`),
  },
  {
    id: 'science-sagan-pale',
    title: 'Pale Blue Dot',
    author: 'Carl Sagan',
    requiredReads: 2,
    textDifficulty: 'intermediate',
    words: w(`Look again at that dot. That's here. That's home. That's us. On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives. The aggregate of our joy and suffering, thousands of confident religions, ideologies, and economic doctrines, every hunter and forager, every hero and coward, every creator and destroyer of civilization, every king and peasant, every young couple in love.`),
  },
  // ─── Unlock after 4 reads ───
  {
    id: 'science-einstein',
    title: 'On Scientific Method',
    author: 'Albert Einstein',
    requiredReads: 4,
    textDifficulty: 'beginner',
    words: w(`The most beautiful thing we can experience is the mysterious. It is the source of all true art and science. He to whom the emotion is a stranger, who can no longer pause to wonder and stand wrapped in awe, is as good as dead; his eyes are closed. Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.`),
  },
  {
    id: 'science-hawking',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    requiredReads: 4,
    textDifficulty: 'intermediate',
    words: w(`We find ourselves in a bewildering world. We want to make sense of what we see around us and to ask: What is the nature of the universe? What is our place in it and where did it and we come from? Why is it the way it is? To try to answer these questions we adopt some world picture. Intelligence is the ability to adapt to change. The universe doesn't allow perfection.`),
  },
  // ─── Unlock after 6 reads ───
  {
    id: 'science-darwin-voyage',
    title: 'The Voyage of the Beagle',
    author: 'Charles Darwin',
    requiredReads: 6,
    textDifficulty: 'intermediate',
    words: w(`In calling up images of the past, I find that the plains of Patagonia frequently cross before my eyes; yet these plains are pronounced by all wretched and useless. They can be described only by negative characters; without habitations, without water, without trees, without mountains, they support merely a few dwarf plants. Why, then, have these arid wastes taken so firm a hold on my memory?`),
  },
  {
    id: 'science-galileo',
    title: 'Dialogue Concerning Two Sciences',
    author: 'Galileo Galilei',
    requiredReads: 6,
    textDifficulty: 'advanced',
    words: w(`Philosophy is written in this grand book — I mean the universe — which stands continually open to our gaze, but it cannot be understood unless one first learns to comprehend the language and interpret the characters in which it is written. It is written in the language of mathematics, and its characters are triangles, circles, and other geometrical figures.`),
  },
  // ─── Unlock after 8 reads ───
  {
    id: 'science-faraday',
    title: 'The Chemical History of a Candle',
    author: 'Michael Faraday',
    requiredReads: 8,
    textDifficulty: 'intermediate',
    words: w(`There is no better, there is no more open door by which you can enter into the study of natural philosophy than by considering the physical phenomena of a candle. I propose, therefore, in the course of these lectures, to bring before you, in the first instance, the general character of a candle, pursuing its phenomena in every direction.`),
  },
  {
    id: 'science-principia',
    title: 'Principia Mathematica',
    author: 'Isaac Newton',
    requiredReads: 8,
    textDifficulty: 'intermediate',
    words: w(`I do not know what I may appear to the world, but to myself I seem to have been only like a boy playing on the sea-shore, and diverting myself in now and then finding a smoother pebble or a prettier shell than ordinary, whilst the great ocean of truth lay all undiscovered before me. If I have seen further it is by standing on the shoulders of giants.`),
  },
  // ─── Unlock after 10 reads ───
  {
    id: 'science-copernicus',
    title: 'On the Revolutions',
    author: 'Nicolaus Copernicus',
    requiredReads: 10,
    textDifficulty: 'advanced',
    words: w(`At rest in the middle of everything is the sun. For in this most beautiful temple, who would place this lamp in another or better position than that from which it can light up the whole thing at the same time? For, the sun is not inappropriately called by some people the lantern of the universe, its mind by others, and its ruler by still others.`),
  },
  {
    id: 'science-huxley',
    title: 'On a Piece of Chalk',
    author: 'Thomas Henry Huxley',
    requiredReads: 10,
    textDifficulty: 'intermediate',
    words: w(`A great chapter of the history of the world is written in the chalk. Few passages in the history of man can be supported by such an overwhelming mass of direct and indirect evidence as that which testifies to the truth of the fragment of the history of the globe, which I hope to enable you to read, with your own eyes, tonight.`),
  },
  // ─── Unlock after 12 reads ───
  {
    id: 'science-kepler',
    title: 'Harmonies of the World',
    author: 'Johannes Kepler',
    requiredReads: 12,
    textDifficulty: 'advanced',
    words: w(`Geometry has two great treasures: one is the theorem of Pythagoras, the other the division of a line into extreme and mean ratio. The first we may compare to a measure of gold, the second we may name a precious jewel. The diversity of the phenomena of nature is so great, and the treasures hidden in the heavens so rich, precisely in order that the human mind shall never be lacking in fresh nourishment.`),
  },
  {
    id: 'science-bacon',
    title: 'Novum Organum',
    author: 'Francis Bacon',
    requiredReads: 12,
    textDifficulty: 'advanced',
    words: w(`Knowledge is power. Man, being the servant and interpreter of nature, can do and understand so much and so much only as he has observed in fact or in thought of the course of nature; beyond this he neither knows anything nor can do anything. The subtlety of nature is greater many times over than the subtlety of the senses and understanding.`),
  },
  // ─── Unlock after 14 reads ───
  {
    id: 'science-lyell',
    title: 'Principles of Geology',
    author: 'Charles Lyell',
    requiredReads: 14,
    textDifficulty: 'intermediate',
    words: w(`Never underrate the force of a gradual movement. The waters in the lake are deep and calm, and the stream that flows from it is steady in its course; but the rain-drops that fall upon the mountain are violent and sudden, and the torrent that they form is fierce and rapid. The present is the key to the past.`),
  },
  {
    id: 'science-bohr',
    title: 'On Atomic Theory',
    author: 'Niels Bohr',
    requiredReads: 14,
    textDifficulty: 'advanced',
    words: w(`The opposite of a correct statement is a false statement. But the opposite of a profound truth may well be another profound truth. Every great and deep difficulty bears in itself its own solution. It forces us to change our thinking in order to find it. Prediction is very difficult, especially about the future.`),
  },
  // ─── Unlock after 16 reads ───
  {
    id: 'science-humboldt',
    title: 'Cosmos',
    author: 'Alexander von Humboldt',
    requiredReads: 16,
    textDifficulty: 'intermediate',
    words: w(`Nature, considered rationally, that is to say submitted to the process of thought, is a unity in diversity of phenomena, a harmony blending together all created things, however dissimilar in form and attributes; one great whole animated by the breath of life. The most important result of a rational inquiry into nature is the establishment of the unity and harmony of this stupendous mass of force and matter. In every part of the earth, on land, on the surface of the sea, and in the atmosphere, the organic forces are ceaselessly at work, preparing and arranging the inorganic matter in new forms, and these forms are the most varied reflection of the natural laws that govern the whole. The universe reveals itself as it does because we observe it as we do. The stars, the flowers, the currents of the sea, the forces hidden in the rocks beneath our feet — all are connected, all are chapters in a single great book of nature that we have only begun to read.`),
  },
  {
    id: 'science-harvey',
    title: 'On the Motion of the Heart',
    author: 'William Harvey',
    requiredReads: 16,
    textDifficulty: 'advanced',
    words: w(`When I first gave my mind to vivisections, as a means of discovering the motions and uses of the heart, I found the task so truly arduous that I was almost tempted to think that the motion of the heart was only to be comprehended by God. I could neither rightly perceive at first when the systole and when the diastole took place, nor when and where dilatation and contraction occurred, by reason of the rapidity of the motion. At length, by using greater and daily diligence, having frequent recourse to living animals, employing my senses more, and comparing many observations, I believed that I had attained to the truth. I found that the blood moved in a circle, driven through the arteries by the pumping of the heart, and returning through the veins to be sent forth again — a perpetual motion, like the cycling of water from clouds to rain to rivers to sea, and back again to clouds.`),
  },
  {
    id: 'science-carson',
    title: 'The Sea Around Us',
    author: 'Rachel Carson',
    requiredReads: 16,
    textDifficulty: 'beginner',
    words: w(`The edge of the sea is a strange and beautiful place. All through the long history of Earth it has been an area of unrest where waves have broken heavily against the land, where the tides have pressed forward over the continents, receded, and then returned. It is a place of compromise, conflict, and eternal change. The shore is an ancient world, for as long as there has been an earth and sea there has been this place of the meeting of land and water. Yet it is a world that keeps alive the sense of continuing creation and of the relentless drive of life. Each time that I enter it, I gain some new awareness of its beauty and its deeper meanings, sensing that intricate fabric of life by which one creature is linked with another, and each with its surroundings. In every curving beach, in every grain of sand, there is the story of the earth.`),
  },
];

// ─── Literature ───────────────────────────────────────────────

const literatureTexts: TextEntry[] = [
  // ─── Always Available ───
  {
    id: 'literature-moby-dick',
    title: 'Moby Dick',
    author: 'Herman Melville',
    textDifficulty: 'advanced',
    words: w(`Call me Ishmael. Some years ago — never mind how long precisely — having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; then, I account it high time to get to sea as soon as I can.`),
  },
  {
    id: 'literature-gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    textDifficulty: 'intermediate',
    words: w(`In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. "Whenever you feel like criticizing anyone," he told me, "just remember that all the people in this world haven't had the advantages that you've had." He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.`),
  },
  // ─── Unlock after 2 reads ───
  {
    id: 'literature-romeo-juliet',
    title: 'Romeo and Juliet Prologue',
    author: 'William Shakespeare',
    requiredReads: 2,
    textDifficulty: 'intermediate',
    words: w(`Two households, both alike in dignity, in fair Verona, where we lay our scene, from ancient grudge break to new mutiny, where civil blood makes civil hands unclean. From forth the fatal loins of these two foes a pair of star-crossed lovers take their life; whose misadventured piteous overthrows do with their death bury their parents' strife.`),
  },
  {
    id: 'literature-pride',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    requiredReads: 2,
    textDifficulty: 'intermediate',
    words: w(`It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.`),
  },
  // ─── Unlock after 4 reads ───
  {
    id: 'literature-tale-two',
    title: 'A Tale of Two Cities',
    author: 'Charles Dickens',
    requiredReads: 4,
    textDifficulty: 'intermediate',
    words: w(`It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair, we had everything before us, we had nothing before us.`),
  },
  {
    id: 'literature-anna',
    title: 'Anna Karenina',
    author: 'Leo Tolstoy',
    requiredReads: 4,
    textDifficulty: 'intermediate',
    words: w(`All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue with a French girl, who had been a governess in their family, and she had announced to her husband that she could not go on living in the same house with him.`),
  },
  // ─── Unlock after 6 reads ───
  {
    id: 'literature-1984',
    title: '1984 Opening',
    author: 'George Orwell',
    requiredReads: 6,
    textDifficulty: 'beginner',
    words: w(`It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him. The hallway smelt of boiled cabbage and old rag mats.`),
  },
  {
    id: 'literature-catcher',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    requiredReads: 6,
    textDifficulty: 'beginner',
    words: w(`If you really want to hear about it, the first thing you'll probably want to know is where I was born, and what my lousy childhood was like, and how my parents were occupied and all before they had me, and all that David Copperfield kind of crap, but I don't feel like going into it, if you want to know the truth.`),
  },
  // ─── Unlock after 8 reads ───
  {
    id: 'literature-don-quixote',
    title: 'Don Quixote',
    author: 'Miguel de Cervantes',
    requiredReads: 8,
    textDifficulty: 'intermediate',
    words: w(`In a village of La Mancha, the name of which I have no desire to call to mind, there lived not long since one of those gentlemen that keep a lance in the lance-rack, an old buckler, a lean hack, and a greyhound for coursing. His surname was said to be Quixada, or Quesada, for here there is some difference of opinion among the authors who write on the subject.`),
  },
  {
    id: 'literature-frankenstein',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    requiredReads: 8,
    textDifficulty: 'intermediate',
    words: w(`You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking. I am already far north of London, and as I walk in the streets of Petersburgh, I feel a cold northern breeze play upon my cheeks.`),
  },
  // ─── Unlock after 10 reads ───
  {
    id: 'literature-wuthering',
    title: 'Wuthering Heights',
    author: 'Emily Brontë',
    requiredReads: 10,
    textDifficulty: 'advanced',
    words: w(`I have just returned from a visit to my landlord — the solitary neighbour that I shall be troubled with. This is certainly a beautiful country! In all England, I do not believe that I could have fixed on a situation so completely removed from the stir of society. A perfect misanthropist's Heaven: and Mr. Heathcliff and I are such a suitable pair to divide the desolation between us.`),
  },
  {
    id: 'literature-jane-eyre',
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    requiredReads: 10,
    textDifficulty: 'intermediate',
    words: w(`There was no possibility of taking a walk that day. We had been wandering, indeed, in the leafless shrubbery an hour in the morning; but since dinner the cold winter wind had brought with it clouds so sombre, and a rain so penetrating, that further out-door exercise was now out of the question. I was glad of it: I never liked long walks.`),
  },
  // ─── Unlock after 12 reads ───
  {
    id: 'literature-crime',
    title: 'Crime and Punishment',
    author: 'Fyodor Dostoevsky',
    requiredReads: 12,
    textDifficulty: 'intermediate',
    words: w(`On an exceptionally hot evening early in July a young man came out of the garret in which he lodged in S. Place and walked slowly, as though in hesitation, towards K. bridge. He had successfully avoided meeting his landlady on the staircase. His garret was under the roof of a high, five-storied house and was more like a cupboard than a room.`),
  },
  {
    id: 'literature-brothers',
    title: 'The Brothers Karamazov',
    author: 'Fyodor Dostoevsky',
    requiredReads: 12,
    textDifficulty: 'advanced',
    words: w(`Alexey Fyodorovich Karamazov was the third son of Fyodor Pavlovich Karamazov, a landowner well known in our district in his own day, and still remembered among us owing to his gloomy and tragic death, which happened thirteen years ago, and which I shall describe in its proper place. For the present I will only say that this landowner was a type.`),
  },
  // ─── Unlock after 14 reads ───
  {
    id: 'literature-odyssey',
    title: 'The Odyssey',
    author: 'Homer',
    requiredReads: 14,
    textDifficulty: 'advanced',
    words: w(`Tell me, O muse, of that ingenious hero who travelled far and wide after he had sacked the famous town of Troy. Many cities did he visit, and many were the nations with whose manners and customs he was acquainted; moreover he suffered much by sea while trying to save his own life and bring his men safely home.`),
  },
  {
    id: 'literature-iliad',
    title: 'The Iliad',
    author: 'Homer',
    requiredReads: 14,
    textDifficulty: 'advanced',
    words: w(`Sing, O goddess, the anger of Achilles son of Peleus, that brought countless ills upon the Achaeans. Many a brave soul did it send hurrying down to Hades, and many a hero did it yield a prey to dogs and vultures, for so were the counsels of Jove fulfilled from the day on which the son of Atreus, king of men, and great Achilles, first fell out with one another.`),
  },
  // ─── Unlock after 16 reads ───
  {
    id: 'literature-kafka',
    title: 'The Metamorphosis',
    author: 'Franz Kafka',
    requiredReads: 16,
    textDifficulty: 'intermediate',
    words: w(`One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. What has happened to me? he thought. It was no dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls. A collection of textile samples lay spread out on the table. Above it there hung a picture that he had recently cut out of an illustrated magazine and housed in a nice, gilded frame. It showed a lady fitted out in a fur hat and fur boa who sat upright, raising a heavy fur muff that covered the whole of her lower arm towards the viewer. Gregor then turned to look out the window at the dull weather.`),
  },
  {
    id: 'literature-chopin',
    title: 'The Awakening',
    author: 'Kate Chopin',
    requiredReads: 16,
    textDifficulty: 'beginner',
    words: w(`A certain light was beginning to dawn dimly within her — the light which, showing the way, forbids it. The voice of the sea is seductive; never ceasing, whispering, clamoring, murmuring, inviting the soul to wander for a spell in abysses of solitude; to lose itself in mazes of inward contemplation. The voice of the sea speaks to the soul. The touch of the sea is sensuous, enfolding the body in its soft, close embrace. She could only realize that she herself — her present self — was in some way different from the other self. She was becoming herself and daily casting aside that fictitious self which we assume like a garment with which to appear before the world. But the beginning of things, of a world especially, is necessarily vague, tangled, chaotic, and exceedingly disturbing. How few of us ever emerge from such beginning! How many souls perish in its tumult! The years that are gone seem like dreams — if one might go on sleeping and dreaming.`),
  },
  {
    id: 'literature-austen',
    title: 'Persuasion',
    author: 'Jane Austen',
    requiredReads: 16,
    textDifficulty: 'intermediate',
    words: w(`You pierce my soul. I am half agony, half hope. Tell me not that I am too late, that such precious feelings are gone for ever. I offer myself to you again with a heart even more your own than when you almost broke it, eight years and a half ago. Dare not say that man forgets sooner than woman, that his love has an earlier death. I have loved none but you. Unjust I may have been, weak and resentful I have been, but never inconstant. You alone have brought me to Bath. For you alone, I think and plan. Have you not seen this? I can hardly write. I am every instant hearing something which overpowers me. You sink your voice, but I can distinguish the tones of that voice when they would be lost on others. Too good, too excellent creature! You do us justice, indeed. You do believe that there is true attachment and constancy among men. Believe it to be most fervent, most undeviating. I must go, uncertain of my fate; but I shall return hither, or follow your party, as soon as possible.`),
  },
];

// ─── Poetry ───────────────────────────────────────────────────

const poetryTexts: TextEntry[] = [
  // ─── Always Available ───
  {
    id: 'poetry-road',
    title: 'The Road Not Taken',
    author: 'Robert Frost',
    textDifficulty: 'beginner',
    words: w(`Two roads diverged in a yellow wood, and sorry I could not travel both and be one traveler, long I stood and looked down one as far as I could to where it bent in the undergrowth. I shall be telling this with a sigh somewhere ages and ages hence.`),
  },
  {
    id: 'poetry-sonnet18',
    title: 'Sonnet 18',
    author: 'William Shakespeare',
    textDifficulty: 'intermediate',
    words: w(`Shall I compare thee to a summer's day? Thou art more lovely and more temperate. Rough winds do shake the darling buds of May, and summer's lease hath all too short a date. Sometime too hot the eye of heaven shines, and often is his gold complexion dimmed; and every fair from fair sometime declines, by chance, or nature's changing course, untrimmed.`),
  },
  {
    id: 'poetry-whitman',
    title: 'I Hear America Singing',
    author: 'Walt Whitman',
    textDifficulty: 'beginner',
    words: w(`I hear America singing, the varied carols I hear, those of mechanics, each one singing his as it should be blithe and strong, the carpenter singing his as he measures his plank or beam, the mason singing his as he makes ready for work, or leaves off work, the boatman singing what belongs to him in his boat, the deckhand singing on the steamboat deck.`),
  },
  // ─── Unlock after 2 reads ───
  {
    id: 'poetry-dickinson',
    title: 'Hope is the thing with feathers',
    author: 'Emily Dickinson',
    requiredReads: 2,
    textDifficulty: 'beginner',
    words: w(`Hope is the thing with feathers that perches in the soul, and sings the tune without the words, and never stops at all, and sweetest in the gale is heard; and sore must be the storm that could abash the little bird that kept so many warm. I've heard it in the chillest land, and on the strangest sea; yet, never, in extremity, it asked a crumb of me.`),
  },
  {
    id: 'poetry-raven',
    title: 'The Raven',
    author: 'Edgar Allan Poe',
    requiredReads: 2,
    textDifficulty: 'intermediate',
    words: w(`Once upon a midnight dreary, while I pondered, weak and weary, over many a quaint and curious volume of forgotten lore — while I nodded, nearly napping, suddenly there came a tapping, as of some one gently rapping, rapping at my chamber door. "'Tis some visitor," I muttered, "tapping at my chamber door — only this and nothing more."`),
  },
  // ─── Unlock after 4 reads ───
  {
    id: 'poetry-invictus',
    title: 'Invictus',
    author: 'William Ernest Henley',
    requiredReads: 4,
    textDifficulty: 'intermediate',
    words: w(`Out of the night that covers me, black as the pit from pole to pole, I thank whatever gods may be for my unconquerable soul. In the fell clutch of circumstance I have not winced nor cried aloud. Under the bludgeonings of chance my head is bloody, but unbowed. I am the master of my fate, I am the captain of my soul.`),
  },
  {
    id: 'poetry-ozymandias',
    title: 'Ozymandias',
    author: 'Percy Bysshe Shelley',
    requiredReads: 4,
    textDifficulty: 'intermediate',
    words: w(`I met a traveller from an antique land who said: Two vast and trunkless legs of stone stand in the desert. Near them, on the sand, half sunk, a shattered visage lies. And on the pedestal these words appear: My name is Ozymandias, king of kings: Look on my works, ye Mighty, and despair! Nothing beside remains. Round the decay of that colossal wreck, boundless and bare the lone and level sands stretch far away.`),
  },
  // ─── Unlock after 6 reads ───
  {
    id: 'poetry-tyger',
    title: 'The Tyger',
    author: 'William Blake',
    requiredReads: 6,
    textDifficulty: 'intermediate',
    words: w(`Tyger Tyger, burning bright, in the forests of the night; what immortal hand or eye, could frame thy fearful symmetry? In what distant deeps or skies, burnt the fire of thine eyes? On what wings dare he aspire? What the hand, dare seize the fire? And what shoulder, and what art, could twist the sinews of thy heart?`),
  },
  {
    id: 'poetry-daffodils',
    title: 'I Wandered Lonely as a Cloud',
    author: 'William Wordsworth',
    requiredReads: 6,
    textDifficulty: 'beginner',
    words: w(`I wandered lonely as a cloud that floats on high o'er vales and hills, when all at once I saw a crowd, a host of golden daffodils; beside the lake, beneath the trees, fluttering and dancing in the breeze. Continuous as the stars that shine and twinkle on the milky way, they stretched in never-ending line along the margin of a bay.`),
  },
  // ─── Unlock after 8 reads ───
  {
    id: 'poetry-still-rise',
    title: 'Still I Rise',
    author: 'Maya Angelou',
    requiredReads: 8,
    textDifficulty: 'beginner',
    words: w(`You may write me down in history with your bitter, twisted lies, you may trod me in the very dirt, but still, like dust, I'll rise. Does my sassiness upset you? Why are you beset with gloom? 'Cause I walk like I've got oil wells pumping in my living room. Just like moons and like suns, with the certainty of tides, just like hopes springing high, still I'll rise.`),
  },
  {
    id: 'poetry-if',
    title: 'If—',
    author: 'Rudyard Kipling',
    requiredReads: 8,
    textDifficulty: 'intermediate',
    words: w(`If you can keep your head when all about you are losing theirs and blaming it on you, if you can trust yourself when all men doubt you, but make allowance for their doubting too; if you can wait and not be tired by waiting, or being lied about, don't deal in lies, or being hated, don't give way to hating, and yet don't look too good, nor talk too wise.`),
  },
  // ─── Unlock after 10 reads ───
  {
    id: 'poetry-stopping-woods',
    title: 'Stopping by Woods on a Snowy Evening',
    author: 'Robert Frost',
    requiredReads: 10,
    textDifficulty: 'beginner',
    words: w(`Whose woods these are I think I know. His house is in the village though; he will not see me stopping here to watch his woods fill up with snow. My little horse must think it queer to stop without a farmhouse near between the woods and frozen lake the darkest evening of the year. The woods are lovely, dark and deep, but I have promises to keep, and miles to go before I sleep.`),
  },
  {
    id: 'poetry-ode-nightingale',
    title: 'Ode to a Nightingale',
    author: 'John Keats',
    requiredReads: 10,
    textDifficulty: 'advanced',
    words: w(`My heart aches, and a drowsy numbness pains my sense, as though of hemlock I had drunk, or emptied some dull opiate to the drains one minute past, and Lethe-wards had sunk: 'Tis not through envy of thy happy lot, but being too happy in thine happiness, that thou, light-winged Dryad of the trees, in some melodious plot of beechen green, singest of summer in full-throated ease.`),
  },
  // ─── Unlock after 12 reads ───
  {
    id: 'poetry-do-not-go',
    title: 'Do Not Go Gentle',
    author: 'Dylan Thomas',
    requiredReads: 12,
    textDifficulty: 'intermediate',
    words: w(`Do not go gentle into that good night, old age should burn and rave at close of day; rage, rage against the dying of the light. Though wise men at their end know dark is right, because their words had forked no lightning they do not go gentle into that good night. Good men, the last wave by, crying how bright their frail deeds might have danced in a green bay, rage, rage against the dying of the light.`),
  },
  {
    id: 'poetry-annabel-lee',
    title: 'Annabel Lee',
    author: 'Edgar Allan Poe',
    requiredReads: 12,
    textDifficulty: 'intermediate',
    words: w(`It was many and many a year ago, in a kingdom by the sea, that a maiden there lived whom you may know by the name of Annabel Lee; and this maiden she lived with no other thought than to love and be loved by me. I was a child and she was a child, in this kingdom by the sea, but we loved with a love that was more than love — I and my Annabel Lee.`),
  },
  // ─── Unlock after 14 reads ───
  {
    id: 'poetry-song-myself',
    title: 'Song of Myself',
    author: 'Walt Whitman',
    requiredReads: 14,
    textDifficulty: 'intermediate',
    words: w(`I celebrate myself, and sing myself, and what I assume you shall assume, for every atom belonging to me as good belongs to you. I loafe and invite my soul, I lean and loafe at my ease observing a spear of summer grass. My tongue, every atom of my blood, formed from this soil, this air, born here of parents born here from parents the same, and their parents the same.`),
  },
  {
    id: 'poetry-paradise-lost',
    title: 'Paradise Lost',
    author: 'John Milton',
    requiredReads: 14,
    textDifficulty: 'advanced',
    words: w(`Of Man's first disobedience, and the fruit of that forbidden tree whose mortal taste brought death into the World, and all our woe, with loss of Eden, till one greater Man restore us, and regain the blissful seat, sing, Heavenly Muse. The mind is its own place, and in itself can make a Heaven of Hell, a Hell of Heaven.`),
  },
  // ─── Unlock after 16 reads ───
  {
    id: 'poetry-lazarus',
    title: 'The New Colossus',
    author: 'Emma Lazarus',
    requiredReads: 16,
    textDifficulty: 'beginner',
    words: w(`Not like the brazen giant of Greek fame, with conquering limbs astride from land to land; here at our sea-washed, sunset gates shall stand a mighty woman with a torch, whose flame is the imprisoned lightning, and her name Mother of Exiles. From her beacon-hand glows world-wide welcome; her mild eyes command the air-bridged harbor that twin cities frame. "Keep, ancient lands, your storied pomp!" cries she with silent lips. "Give me your tired, your poor, your huddled masses yearning to breathe free, the wretched refuse of your teeming shore. Send these, the homeless, tempest-tost to me, I lift my lamp beside the golden door!" These words, inscribed upon the pedestal of the Statue of Liberty, have greeted millions of arrivals to a new world and a new life. Written in 1883 by Emma Lazarus, they transformed a monument of engineering into a symbol of hope.`),
  },
  {
    id: 'poetry-dunbar',
    title: 'We Wear the Mask',
    author: 'Paul Laurence Dunbar',
    requiredReads: 16,
    textDifficulty: 'intermediate',
    words: w(`We wear the mask that grins and lies, it hides our cheeks and shades our eyes — this debt we pay to human guile; with torn and bleeding hearts we smile, and mouth with myriad subtleties. Why should the world be over-wise, in counting all our tears and sighs? Nay, let them only see us, while we wear the mask. We smile, but, O great Christ, our cries to thee from tortured souls arise. We sing, but oh the clay is vile beneath our feet, and long the mile; but let the world dream otherwise, we wear the mask! Paul Laurence Dunbar, born in 1872 to formerly enslaved parents, became one of the first widely acclaimed African American poets. His verse captures the duality of presenting a composed face to a world that would rather not acknowledge inner anguish. The mask becomes both armor and prison, a survival strategy carried forward through generations.`),
  },
  {
    id: 'poetry-frost',
    title: 'The Road Not Taken',
    author: 'Robert Frost',
    requiredReads: 16,
    textDifficulty: 'beginner',
    words: w(`Two roads diverged in a yellow wood, and sorry I could not travel both and be one traveler, long I stood and looked down one as far as I could to where it bent in the undergrowth; then took the other, as just as fair, and having perhaps the better claim, because it was grassy and wanted wear; though as for that the passing there had worn them really about the same, and both that morning equally lay in leaves no step had trodden black. Oh, I kept the first for another day! Yet knowing how way leads on to way, I doubted if I should ever come back. I shall be telling this with a sigh somewhere ages and ages hence: Two roads diverged in a wood, and I — I took the one less traveled by, and that has made all the difference.`),
  },
];

// ─── History ──────────────────────────────────────────────────

const historyTexts: TextEntry[] = [
  // ─── Always Available ───
  {
    id: 'history-civilization',
    title: 'The Story of Civilization',
    textDifficulty: 'beginner',
    words: w(`In the beginning, there was nothing. Then there was everything. The story of civilization is the story of people who refused to accept the world as it was. History is not the past. It is the present. We carry our history with us. We are our history.`),
  },
  {
    id: 'history-herodotus',
    title: 'The Histories',
    author: 'Herodotus',
    textDifficulty: 'advanced',
    words: w(`These are the researches of Herodotus of Halicarnassus, which he publishes, in the hope of thereby preserving from decay the remembrance of what men have done, and of preventing the great and wonderful actions of the Greeks and the Barbarians from losing their due meed of glory; and withal to put on record what were their grounds of feud. According to the Persians best informed in history, the Phoenicians began the quarrel.`),
  },
  {
    id: 'history-declaration-full',
    title: 'Declaration of Independence — Full Preamble',
    author: 'Thomas Jefferson',
    textDifficulty: 'intermediate',
    words: w(`When in the Course of human events, it becomes necessary for one people to dissolve the political bands which have connected them with another, and to assume among the powers of the earth, the separate and equal station to which the Laws of Nature and of Nature's God entitle them, a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation. We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.`),
  },
  // ─── Unlock after 2 reads ───
  {
    id: 'history-thucydides',
    title: 'History of the Peloponnesian War',
    author: 'Thucydides',
    requiredReads: 2,
    textDifficulty: 'advanced',
    words: w(`Thucydides, an Athenian, wrote the history of the war between the Peloponnesians and the Athenians, beginning at the moment that it broke out, and believing that it would be a great war, and more worthy of relation than any that had preceded it. The absence of romance in my history will, I fear, detract somewhat from its interest; but if it be judged useful by those who desire an exact knowledge of the past.`),
  },
  {
    id: 'history-caesar',
    title: 'The Gallic Wars',
    author: 'Julius Caesar',
    requiredReads: 2,
    textDifficulty: 'intermediate',
    words: w(`All Gaul is divided into three parts, one of which the Belgae inhabit, the Aquitani another, those who in their own language are called Celts, in our Gauls, the third. All these differ from each other in language, customs and laws. The river Garonne separates the Gauls from the Aquitani; the Marne and the Seine separate them from the Belgae.`),
  },
  // ─── Unlock after 4 reads ───
  {
    id: 'history-gibbon',
    title: 'The Decline and Fall of the Roman Empire',
    author: 'Edward Gibbon',
    requiredReads: 4,
    textDifficulty: 'advanced',
    words: w(`In the second century of the Christian era, the empire of Rome comprehended the fairest part of the earth, and the most civilised portion of mankind. The frontiers of that extensive monarchy were guarded by ancient renown and disciplined valour. The gentle but powerful influence of laws and manners had gradually cemented the union of the provinces.`),
  },
  {
    id: 'history-magna-carta',
    title: 'Magna Carta',
    requiredReads: 4,
    textDifficulty: 'advanced',
    words: w(`Know that before God, for the health of our soul and those of our ancestors and heirs, to the honour of God, the exaltation of the holy Church, and the better ordering of our kingdom. First, that we have granted to God, and by this present charter have confirmed for us and our heirs in perpetuity, that the English Church shall be free, and shall have its rights undiminished, and its liberties unimpaired.`),
  },
  // ─── Unlock after 6 reads ───
  {
    id: 'history-tacitus',
    title: 'Annals',
    author: 'Tacitus',
    requiredReads: 6,
    textDifficulty: 'advanced',
    words: w(`Rome at the beginning was ruled by kings. Freedom and the consulship were established by Lucius Brutus. Dictatorships were held for a temporary crisis. The power of the decemvirs did not last beyond two years, nor was the consular jurisdiction of the military tribunes of long duration. The despotism of Cinna was brief; the rule of Sulla soon ended.`),
  },
  {
    id: 'history-constitution',
    title: 'The Constitution of the United States',
    requiredReads: 6,
    textDifficulty: 'intermediate',
    words: w(`We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.`),
  },
  // ─── Unlock after 8 reads ───
  {
    id: 'history-plutarch',
    title: 'Parallel Lives',
    author: 'Plutarch',
    requiredReads: 8,
    textDifficulty: 'intermediate',
    words: w(`It was for the sake of others that I first commenced writing biographies; but I find myself proceeding and attaching myself to it for my own; the virtues of these great men serving me as a sort of looking-glass, in which I may see how to adjust and adorn my own life. I seek to know what manner of men the great leaders were.`),
  },
  {
    id: 'history-livy',
    title: 'Ab Urbe Condita',
    author: 'Livy',
    requiredReads: 8,
    textDifficulty: 'advanced',
    words: w(`Whether I shall accomplish anything worthy of the labour, if I record the achievements of the Roman people from the foundation of the city, I do not really know, nor if I knew would I dare to avouch it; perceiving as I do that the theme is both old and hackneyed, while new writers constantly believe that they will either surpass the ancients in historical accuracy or in style.`),
  },
  // ─── Unlock after 10 reads ───
  {
    id: 'history-churchill-ww2',
    title: 'The Second World War',
    author: 'Winston Churchill',
    requiredReads: 10,
    textDifficulty: 'intermediate',
    words: w(`One day President Roosevelt told me that he was asking publicly for suggestions about what the war should be called. I said at once "The Unnecessary War." There never was a war more easy to stop than that which has just wrecked what was left of the world from the previous struggle. The human tragedy reaches its climax in the fact that after all the exertions and sacrifices of hundreds of millions of people.`),
  },
  {
    id: 'history-federalist',
    title: 'The Federalist Papers',
    author: 'Alexander Hamilton',
    requiredReads: 10,
    textDifficulty: 'advanced',
    words: w(`After an unequivocal experience of the inefficiency of the subsisting federal government, you are called upon to deliberate on a new Constitution for the United States of America. The subject speaks its own importance; comprehending in its consequences nothing less than the existence of the Union, the safety and welfare of the parts of which it is composed.`),
  },
  // ─── Unlock after 12 reads ───
  {
    id: 'history-marco-polo',
    title: 'The Travels of Marco Polo',
    author: 'Marco Polo',
    requiredReads: 12,
    textDifficulty: 'intermediate',
    words: w(`Ye emperors, kings, dukes, marquises, earls, and knights, and all other people desirous of knowing the diversities of the races of mankind, as well as the diversities of kingdoms, provinces, and regions of all parts of the East, read through this book, and ye will find in it the greatest and most marvellous characteristics of the peoples especially of Armenia, Persia, India, and Tartary.`),
  },
  {
    id: 'history-bede',
    title: 'Ecclesiastical History of the English People',
    author: 'The Venerable Bede',
    requiredReads: 12,
    textDifficulty: 'intermediate',
    words: w(`Britain, an island in the Atlantic, formerly called Albion, lies to the north-west, facing, though at a considerable distance, the coasts of Germany, France, and Spain, which form the greater part of Europe. It extends 800 miles in length towards the north, and is 200 miles in breadth, except where several promontories extend further in breadth.`),
  },
  // ─── Unlock after 14 reads ───
  {
    id: 'history-machiavelli',
    title: 'The Prince',
    author: 'Niccolò Machiavelli',
    requiredReads: 14,
    textDifficulty: 'advanced',
    words: w(`All states, all powers, that have held and hold rule over men have been and are either republics or principalities. Principalities are either hereditary, in which the family has been long established; or they are new. The new are either entirely new, as was Milan to Francesco Sforza, or they are, as it were, members annexed to the hereditary state.`),
  },
  {
    id: 'history-augustine',
    title: 'Confessions',
    author: 'Saint Augustine',
    requiredReads: 14,
    textDifficulty: 'advanced',
    words: w(`Great art Thou, O Lord, and greatly to be praised; great is Thy power, and Thy wisdom infinite. And Thee would man praise; man, but a particle of Thy creation; man, that bears about him his mortality, the witness of his sin, the witness that Thou resistest the proud: yet would man praise Thee; he, but a particle of Thy creation.`),
  },
  // ─── Unlock after 16 reads ───
  {
    id: 'history-herodotus',
    title: 'The Histories: Thermopylae',
    author: 'Herodotus',
    requiredReads: 16,
    textDifficulty: 'intermediate',
    words: w(`The Greeks at Thermopylae were first warned of the approach of the Persians by the scouts who came running down from the heights. A council was held, and opinions were divided. Some were for retreating at once, but Leonidas of Sparta gave his vote for remaining. So the Greeks stayed and awaited the onset of the great king's army. When the Persians drew near, the Greeks under Leonidas advanced and gave battle. The barbarians fell in heaps, for the narrow pass prevented them from making use of their numbers. Behind them the captains of the squadrons, armed with whips, urged the men forward with continual blows. Many fell into the sea and were drowned; and far more were trampled underfoot by their own soldiers. Though the Greeks knew full well that their own doom was sealed, since those who held the mountain path had already departed, they went forth and fought with reckless desperation, exerting their utmost strength against the barbarians, caring nothing for their own lives.`),
  },
  {
    id: 'history-pliny',
    title: 'Letters: The Eruption of Vesuvius',
    author: 'Pliny the Younger',
    requiredReads: 16,
    textDifficulty: 'advanced',
    words: w(`On the twenty-fourth of August, about one in the afternoon, my mother desired my uncle to observe a cloud which appeared of a very unusual size and shape. A cloud was ascending, the appearance of which I cannot give you a more exact description of than by likening it to that of a pine tree, for it shot up to a great height in the form of a very tall trunk, which spread itself out at the top into several branches. It appeared sometimes bright and sometimes dark and spotted, depending upon whether it was more or less impregnated with earth and cinders. Ashes were already falling, hotter and thicker as we drew near. We also saw the sea sucked away and apparently forced back by the earthquake. Broadly-spreading sheets of fire lit up many parts of Vesuvius; their bright glare was emphasized by the darkness of night. My uncle tried to allay their fears, saying these were merely bonfires left by the peasants in their terror. Then he rested, and slept in all certainty, for his breathing was heard by those who attended at his door.`),
  },
  {
    id: 'history-viking-saga',
    title: 'The Saga of Erik the Red',
    requiredReads: 16,
    textDifficulty: 'intermediate',
    words: w(`There was a man named Erik who was called the Red. He had sailed west from Iceland seeking new land, for he had heard tales of a green country beyond the ice. After many days of sailing through fog and treacherous waters, Erik and his crew sighted a great coast of mountains and glaciers. They sailed south along this coast until they found fjords where the grass grew green and the rivers ran clear with fish. Erik called this land Greenland, for he said that people would be more easily persuaded to go there if the land had an attractive name. He spent three winters exploring the fjords and valleys, marking the best places for farms. When he returned to Iceland, he spoke so well of the new country that twenty-five ships set sail with him on his return, though only fourteen completed the voyage. Those who arrived built homesteads in the sheltered fjords, raised cattle and sheep, and hunted seals along the coast. From this settlement, the Norse would one day sail even further west, to the shores of a vast continent they called Vinland.`),
  },
];

// ─── Mindfulness ──────────────────────────────────────────────

const mindfulnessTexts: TextEntry[] = [
  // ─── Always Available ───
  {
    id: 'mindfulness-presence',
    title: 'On Presence',
    textDifficulty: 'beginner',
    words: w(`Breathe. Be here. Be now. The present moment is filled with joy and happiness. If you are attentive, you will see it. Peace comes from within. Do not seek it without. The mind is everything. What you think, you become. In the middle of difficulty lies opportunity.`),
  },
  {
    id: 'mindfulness-tao',
    title: 'Tao Te Ching',
    author: 'Lao Tzu',
    textDifficulty: 'intermediate',
    words: w(`The Tao that can be told is not the eternal Tao. The name that can be named is not the eternal name. The nameless is the beginning of heaven and earth. The named is the mother of ten thousand things. Ever desireless, one can see the mystery. Ever desiring, one can see the manifestations. These two spring from the same source but differ in name; this appears as darkness. Darkness within darkness. The gate to all mystery.`),
  },
  {
    id: 'mindfulness-meditations-calm',
    title: 'On Calm and Presence',
    author: 'Marcus Aurelius',
    textDifficulty: 'intermediate',
    words: w(`You have power over your mind — not outside events. Realize this, and you will find strength. The soul becomes dyed with the color of its thoughts. Think only on those things that are in line with your principles and can bear the full light of day. The object of life is not to be on the side of the majority, but to escape finding oneself in the ranks of the insane. Waste no more time arguing about what a good person should be. Be one.`),
  },
  // ─── Unlock after 2 reads ───
  {
    id: 'mindfulness-thich',
    title: 'The Miracle of Mindfulness',
    author: 'Thich Nhat Hanh',
    requiredReads: 2,
    textDifficulty: 'beginner',
    words: w(`Drink your tea slowly and reverently, as if it is the axis on which the world earth revolves — slowly, evenly, without rushing toward the future. Live the actual moment. Only this moment is life. Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor. Walk as if you are kissing the Earth with your feet.`),
  },
  {
    id: 'mindfulness-zen-mind',
    title: 'Zen Mind, Beginner\'s Mind',
    author: 'Shunryu Suzuki',
    requiredReads: 2,
    textDifficulty: 'intermediate',
    words: w(`In the beginner's mind there are many possibilities, but in the expert's there are few. If your mind is empty, it is always ready for anything; it is open to everything. In the beginner's mind there is no thought, "I have attained something." All self-centered thoughts limit our vast mind. When we have no thought of achievement, no thought of self, we are true beginners.`),
  },
  // ─── Unlock after 4 reads ───
  {
    id: 'mindfulness-rumi',
    title: 'The Guest House',
    author: 'Rumi',
    requiredReads: 4,
    textDifficulty: 'beginner',
    words: w(`This being human is a guest house. Every morning a new arrival. A joy, a depression, a meanness, some momentary awareness comes as an unexpected visitor. Welcome and entertain them all! Even if they're a crowd of sorrows, who violently sweep your house empty of its furniture, still, treat each guest honorably. He may be clearing you out for some new delight.`),
  },
  {
    id: 'mindfulness-kahlil',
    title: 'The Prophet',
    author: 'Kahlil Gibran',
    requiredReads: 4,
    textDifficulty: 'intermediate',
    words: w(`Your pain is the breaking of the shell that encloses your understanding. Even as the stone of the fruit must break, that its heart may stand in the sun, so must you know pain. And could you keep your heart in wonder at the daily miracles of your life, your pain would not seem less wondrous than your joy.`),
  },
  // ─── Unlock after 6 reads ───
  {
    id: 'mindfulness-dhammapada',
    title: 'Dhammapada',
    author: 'Buddha',
    requiredReads: 6,
    textDifficulty: 'intermediate',
    words: w(`All that we are is the result of what we have thought: it is founded on our thoughts, it is made up of our thoughts. If a man speaks or acts with an evil thought, pain follows him, as the wheel follows the foot of the ox that draws the carriage. If a man speaks or acts with a pure thought, happiness follows him, like a shadow that never leaves him.`),
  },
  {
    id: 'mindfulness-eckhart',
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    requiredReads: 6,
    textDifficulty: 'beginner',
    words: w(`Realize deeply that the present moment is all you have. Make the NOW the primary focus of your life. Time isn't precious at all, because it is an illusion. What you perceive as precious is not time but the one point that is out of time: the Now. The more you are focused on time — past and future — the more you miss the Now.`),
  },
  // ─── Unlock after 8 reads ───
  {
    id: 'mindfulness-chuang',
    title: 'The Way of Chuang Tzu',
    author: 'Chuang Tzu',
    requiredReads: 8,
    textDifficulty: 'advanced',
    words: w(`The fish trap exists because of the fish; once you've gotten the fish, you can forget the trap. Words exist because of meaning; once you've gotten the meaning, you can forget the words. Where can I find a man who has forgotten words so I can have a word with him? Flow with whatever may happen and let your mind be free. Stay centered by accepting whatever you are doing.`),
  },
  {
    id: 'mindfulness-thoreau-simplify',
    title: 'Simplify, Simplify',
    author: 'Henry David Thoreau',
    requiredReads: 8,
    textDifficulty: 'intermediate',
    words: w(`Simplify, simplify. Instead of three meals a day, if it be necessary eat but one; instead of a hundred dishes, five; and reduce other things in proportion. Our life is frittered away by detail. Simplicity, simplicity, simplicity! Let your affairs be as two or three, and not a hundred or a thousand; instead of a million count half a dozen, and keep your accounts on your thumb-nail.`),
  },
  // ─── Unlock after 10 reads ───
  {
    id: 'mindfulness-hafiz',
    title: 'The Gift',
    author: 'Hafiz',
    requiredReads: 10,
    textDifficulty: 'beginner',
    words: w(`Even after all this time the sun never says to the earth, "You owe me." Look what happens with a love like that. It lights the whole sky. Fear is the cheapest room in the house. I would like to see you living in better conditions. What we speak becomes the house we live in. Every child has known God.`),
  },
  {
    id: 'mindfulness-pema',
    title: 'When Things Fall Apart',
    author: 'Pema Chödrön',
    requiredReads: 10,
    textDifficulty: 'intermediate',
    words: w(`We think that the point is to pass the test or overcome the problem, but the truth is that things don't really get solved. They come together and they fall apart. Then they come together again and fall apart again. It's just like that. The healing comes from letting there be room for all of this to happen: room for grief, for relief, for misery, for joy.`),
  },
  // ─── Unlock after 12 reads ───
  {
    id: 'mindfulness-kabat-zinn',
    title: 'Wherever You Go, There You Are',
    author: 'Jon Kabat-Zinn',
    requiredReads: 12,
    textDifficulty: 'beginner',
    words: w(`Mindfulness means paying attention in a particular way: on purpose, in the present moment, and non-judgmentally. This kind of attention nurtures greater awareness, clarity, and acceptance of present-moment reality. The little things? The little moments? They aren't little. You can't stop the waves, but you can learn to surf.`),
  },
  {
    id: 'mindfulness-osho',
    title: 'Awareness',
    author: 'Osho',
    requiredReads: 12,
    textDifficulty: 'beginner',
    words: w(`Be realistic: Plan for a miracle. If you are a parent, open doors to unknown directions to the child so he can explore. Don't put him on a fixed track. Creativity is the greatest rebellion in existence. Experience life in all possible ways — good-bad, bitter-sweet, dark-light, summer-winter. Experience all the dualities.`),
  },
  // ─── Unlock after 14 reads ───
  {
    id: 'mindfulness-krishnamurti',
    title: 'Freedom from the Known',
    author: 'Jiddu Krishnamurti',
    requiredReads: 14,
    textDifficulty: 'advanced',
    words: w(`You must understand the whole of life, not just one little part of it. That is why you must read, that is why you must look at the skies, that is why you must sing, and dance, and write poems, and suffer, and understand, for all that is life. Tradition becomes our security, and when the mind is secure it is in decay.`),
  },
  {
    id: 'mindfulness-watts',
    title: 'The Wisdom of Insecurity',
    author: 'Alan Watts',
    requiredReads: 14,
    textDifficulty: 'advanced',
    words: w(`The only way to make sense out of change is to plunge into it, move with it, and join the dance. We seldom realize, for example, that our most private thoughts and emotions are not actually our own. For we think in terms of languages and images which we did not invent. Muddy water is best cleared by leaving it alone.`),
  },
  // ─── Unlock after 16 reads ───
  {
    id: 'mindfulness-gita',
    title: 'The Bhagavad Gita',
    requiredReads: 16,
    textDifficulty: 'intermediate',
    words: w(`You have the right to work, but never to the fruit of work. You should never engage in action for the sake of reward, nor should you long for inaction. Perform work in this world, Arjuna, as a man established within himself — without selfish attachments, and alike in success and defeat. The awakened sages call a person wise when all undertakings are free from anxiety about results. In the dark night of all beings, the self-controlled one is awake. What is night for all beings is the time of awakening for the disciplined soul. As the ocean remains unmoved by the waters that flow into it, so the wise person remains unmoved by desires. The soul is never born nor does it ever perish. It is unborn, eternal, ever-existing, and primeval. It is not slain when the body is slain. As a person puts on new garments, giving up old ones, the soul similarly accepts new material bodies, giving up the old and useless ones. Reshape yourself through the power of your will. Those who have conquered themselves live in peace, alike in cold and heat, pleasure and pain, praise and blame.`),
  },
  {
    id: 'mindfulness-rilke',
    title: 'Letters to a Young Poet',
    author: 'Rainer Maria Rilke',
    requiredReads: 16,
    textDifficulty: 'beginner',
    words: w(`I want to beg you, as much as I can, to be patient toward all that is unsolved in your heart and to try to love the questions themselves like locked rooms and like books that are written in a very foreign tongue. Do not now seek the answers, which cannot be given you because you would not be able to live them. And the point is, to live everything. Live the questions now. Perhaps you will then gradually, without noticing it, live along some distant day into the answer. Perhaps you do carry within yourself the possibility of shaping and forming, as a particularly happy and pure way of living. Train yourself for it, but take whatever comes with great trust, and if only it comes out of your own will, out of some need of your innermost being, take it upon yourself and hate nothing. We need, in love, to practice only this: letting each other go. For holding on comes easily; we do not need to learn it.`),
  },
  {
    id: 'mindfulness-rumi',
    title: 'The Guest House',
    author: 'Rumi',
    requiredReads: 16,
    textDifficulty: 'beginner',
    words: w(`This being human is a guest house. Every morning a new arrival. A joy, a depression, a meanness, some momentary awareness comes as an unexpected visitor. Welcome and entertain them all! Even if they are a crowd of sorrows, who violently sweep your house empty of its furniture, still, treat each guest honourably. He may be clearing you out for some new delight. The dark thought, the shame, the malice — meet them at the door laughing and invite them in. Be grateful for whatever comes, because each has been sent as a guide from beyond. Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray. The wound is the place where the Light enters you. What you seek is seeking you. Out beyond ideas of wrongdoing and rightdoing, there is a field. I will meet you there. When the soul lies down in that grass, the world is too full to talk about. Do not be satisfied with the stories that come before you. Unfold your own myth.`),
  },
];

// ─── Free Category Keys (shared constant) ───────────────────

export const FREE_CATEGORY_KEYS = ['story', 'poetry', 'wisdom'] as const;

// ─── Export ───────────────────────────────────────────────────

/**
 * Get texts filtered by user's reading level and premium status.
 * Texts are available if:
 * 1. Their difficulty is <= user's level (or difficulty is undefined = available to all)
 * 2. Their tier matches user's access (free texts available to all, premium only to premium users)
 */
export function getAvailableTexts(
  texts: TextEntry[],
  userLevel: number,
  isPremium: boolean
): TextEntry[] {
  return texts.filter((text) => {
    const difficultyOk = !text.difficulty || text.difficulty <= userLevel;
    const tierOk = !text.tier || text.tier === 'free' || isPremium;
    return difficultyOk && tierOk;
  });
}

/**
 * Get texts for a specific difficulty level.
 * Returns texts that match exactly the given difficulty level.
 */
export function getTextsAtLevel(texts: TextEntry[], level: number): TextEntry[] {
  return texts.filter((text) => text.difficulty === level);
}

/**
 * Get all texts across all categories that match the user's level and premium status.
 */
export function getAllAvailableTexts(
  userLevel: number,
  isPremium: boolean
): { category: Category; text: TextEntry }[] {
  const results: { category: Category; text: TextEntry }[] = [];
  for (const category of categories) {
    for (const text of category.texts) {
      const difficultyOk = !text.difficulty || text.difficulty <= userLevel;
      const tierOk = !text.tier || text.tier === 'free' || isPremium;
      if (difficultyOk && tierOk) {
        results.push({ category, text });
      }
    }
  }
  return results;
}

export const categories: Category[] = [
  {
    key: 'story',
    name: 'Story',
    icon: 'book-open',
    level: 'beginner',
    texts: storyTexts,
  },
  {
    key: 'essay',
    name: 'Essays',
    icon: 'file-text',
    level: 'intermediate',
    texts: articleTexts,
  },
  {
    key: 'speech',
    name: 'Speech',
    icon: 'mic',
    level: 'intermediate',
    texts: speechTexts,
  },
  {
    key: 'philosophy',
    name: 'Philosophy',
    icon: 'compass',
    level: 'advanced',
    texts: philosophyTexts,
  },
  {
    key: 'science',
    name: 'Science',
    icon: 'zap',
    level: 'intermediate',
    texts: scienceTexts,
  },
  {
    key: 'fiction',
    name: 'Fiction',
    icon: 'bookmark',
    level: 'intermediate',
    texts: literatureTexts,
  },
  {
    key: 'poetry',
    name: 'Poetry',
    icon: 'feather',
    level: 'beginner',
    texts: poetryTexts,
  },
  {
    key: 'history',
    name: 'History',
    icon: 'clock',
    level: 'intermediate',
    texts: historyTexts,
  },
  {
    key: 'wisdom',
    name: 'Wisdom',
    icon: 'wind',
    level: 'beginner',
    texts: mindfulnessTexts,
  },
];
