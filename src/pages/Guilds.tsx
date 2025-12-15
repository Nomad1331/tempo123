import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGuilds, Guild, GuildMember } from '@/hooks/useGuilds';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Castle, Users, Crown, Shield, Swords, MessageSquare, 
  Plus, LogOut, Trash2, Send, Trophy, Zap, Mail,
  Globe, UserPlus, Star, Flame, Target, Eye, ChevronUp, ChevronDown, X,
  Clock, UserX, Sparkles
} from 'lucide-react';
import { HunterProfileModal } from '@/components/HunterProfileModal';
import { HunterAvatar } from '@/components/HunterAvatar';
import GuildChallengesPanel from '@/components/GuildChallengesPanel';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_COLORS: Record<string, string> = {
  guild_master: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  vice_master: 'bg-violet-500/20 text-violet-400 border-violet-500/50',
  elite: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
  member: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
};

const ROLE_LABELS: Record<string, string> = {
  guild_master: 'Guild Master',
  vice_master: 'Vice Master',
  elite: 'Elite',
  member: 'Member',
};

const ACCESS_ICONS: Record<string, React.ReactNode> = {
  public: <Globe className="h-4 w-4" />,
  invite_only: <UserPlus className="h-4 w-4" />,
};

// Power tier colors for guild gate styling
const getPowerTier = (power: number) => {
  if (power >= 10000) return { tier: 'legendary', color: 'from-yellow-500 to-amber-600', glow: 'shadow-[0_0_30px_hsl(45_100%_50%/0.4)]', borderColor: 'border-yellow-500/70' };
  if (power >= 5000) return { tier: 'epic', color: 'from-violet-500 to-purple-600', glow: 'shadow-[0_0_25px_hsl(270_70%_60%/0.4)]', borderColor: 'border-violet-500/60' };
  if (power >= 2000) return { tier: 'rare', color: 'from-cyan-500 to-blue-600', glow: 'shadow-[0_0_20px_hsl(186_100%_50%/0.3)]', borderColor: 'border-cyan-500/50' };
  if (power >= 500) return { tier: 'uncommon', color: 'from-emerald-500 to-green-600', glow: 'shadow-[0_0_15px_hsl(160_70%_50%/0.3)]', borderColor: 'border-emerald-500/40' };
  return { tier: 'common', color: 'from-slate-500 to-gray-600', glow: '', borderColor: 'border-slate-500/30' };
};

interface SearchResult {
  user_id: string;
  hunter_name: string;
  avatar: string;
}

const Guilds = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    guilds,
    myGuild,
    myMembership,
    guildMembers,
    guildMessages,
    myInvites,
    sentInvites,
    loading,
    createGuild,
    joinGuild,
    leaveGuild,
    disbandGuild,
    sendMessage,
    acceptInvite,
    declineInvite,
    searchUsers,
    sendInvite,
    revokeInvite,
    promoteMember,
    demoteMember,
    kickMember,
  } = useGuilds();

  const [activeTab, setActiveTab] = useState<string>(myGuild ? 'my-guild' : 'browse');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [guildName, setGuildName] = useState('');
  const [guildDescription, setGuildDescription] = useState('');
  const [accessType, setAccessType] = useState<'public' | 'invite_only'>('public');
  const [messageInput, setMessageInput] = useState('');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDisband, setConfirmDisband] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GuildMember | null>(null);
  const [manageMemberModal, setManageMemberModal] = useState<GuildMember | null>(null);
  const [manageInvitesOpen, setManageInvitesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [guildMessages]);

  // Update tab when guild changes
  useEffect(() => {
    if (myGuild && activeTab === 'browse') {
      setActiveTab('my-guild');
    }
  }, [myGuild]);

  const handleCreateGuild = async () => {
    if (!guildName.trim()) return;
    
    const success = await createGuild(guildName, guildDescription, accessType);
    if (success) {
      setCreateModalOpen(false);
      setGuildName('');
      setGuildDescription('');
      setAccessType('public');
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    const success = await sendMessage(messageInput);
    if (success) {
      setMessageInput('');
    }
  };

  // Search for users to invite
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await searchUsers(query);
    setSearchResults(results);
    setSearching(false);
  };

  const handleInvite = async (inviteeId: string, inviteeName: string) => {
    const success = await sendInvite(inviteeId, inviteeName);
    if (success) {
      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.user_id !== inviteeId));
    }
  };

  const canInvite = myMembership && ['guild_master', 'vice_master', 'elite'].includes(myMembership.role);

  if (!user) {
    return (
      <main className="md:pl-[70px] pt-16 pb-8 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <Castle className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
              <h2 className="text-2xl font-orbitron font-bold mb-2">Join the Hunt</h2>
              <p className="text-muted-foreground mb-6">
                Sign in to create or join guilds and battle alongside fellow hunters!
              </p>
              <Button onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90">
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="md:pl-[70px] pt-16 pb-8 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Epic Header */}
        <div className="relative text-center py-8 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-violet-500/10 to-transparent rounded-3xl blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.3),transparent_50%)]" />
          
          {/* Decorative Elements */}
          <div className="absolute top-4 left-1/4 w-1 h-16 bg-gradient-to-b from-primary/50 to-transparent" />
          <div className="absolute top-4 right-1/4 w-1 h-16 bg-gradient-to-b from-primary/50 to-transparent" />
          
          <div className="relative">
            <div className="flex items-center justify-center gap-6 mb-4">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Castle className="h-12 w-12 text-primary drop-shadow-[0_0_15px_hsl(var(--primary)/0.8)]" />
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-bold font-orbitron tracking-wider">
                <span className="bg-gradient-to-r from-primary via-cyan-300 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
                  GUILD HALL
                </span>
              </h1>
              
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <Castle className="h-12 w-12 text-primary drop-shadow-[0_0_15px_hsl(var(--primary)/0.8)]" />
              </motion.div>
            </div>
            
            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
            
            <p className="text-muted-foreground font-rajdhani text-xl">
              Unite with hunters • Conquer the gates together
            </p>
          </div>
        </div>

        {/* Invites Banner */}
        <AnimatePresence>
          {myInvites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-yellow-500/10 shadow-[0_0_30px_hsl(45_100%_50%/0.2)]">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Mail className="h-6 w-6 text-yellow-400" />
                    </motion.div>
                    <span className="font-orbitron font-semibold text-yellow-400">
                      {myInvites.length} Pending Guild Invite{myInvites.length > 1 ? 's' : ''}!
                    </span>
                  </div>
                  <div className="space-y-2">
                    {myInvites.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between bg-background/30 rounded-lg p-3 border border-yellow-500/20">
                        <div className="flex items-center gap-3">
                          <Castle className="h-5 w-5 text-yellow-400" />
                          <div>
                            <span className="font-medium text-yellow-300">{invite.guild_name}</span>
                            <span className="text-muted-foreground text-sm ml-2">
                              invited by {invite.inviter_name}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptInvite(invite.id, invite.guild_id)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive/50 text-destructive hover:bg-destructive/10"
                            onClick={() => declineInvite(invite.id)}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-card/80 border border-primary/30 p-1.5 backdrop-blur-sm">
            <TabsTrigger 
              value="browse" 
              className="flex items-center gap-2 font-orbitron data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/30 data-[state=active]:to-cyan-500/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Browse Gates</span>
            </TabsTrigger>
            <TabsTrigger 
              value="my-guild" 
              className="flex items-center gap-2 font-orbitron data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/30 data-[state=active]:to-cyan-500/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
            >
              <Castle className="h-4 w-4" />
              <span className="hidden sm:inline">My Guild</span>
            </TabsTrigger>
            <TabsTrigger 
              value="rankings" 
              className="flex items-center gap-2 font-orbitron data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/30 data-[state=active]:to-cyan-500/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Rankings</span>
            </TabsTrigger>
          </TabsList>

          {/* Browse Guilds */}
          <TabsContent value="browse" className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-orbitron text-primary flex items-center gap-3">
                <Target className="h-6 w-6" />
                Available Guild Gates
              </h2>
              {!myGuild && (
                <Button 
                  onClick={() => setCreateModalOpen(true)} 
                  className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Establish Guild
                </Button>
              )}
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : guilds.length === 0 ? (
              <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-background">
                <CardContent className="py-16 text-center">
                  <Castle className="h-20 w-20 mx-auto mb-4 opacity-30 text-primary" />
                  <p className="text-muted-foreground text-lg">No guilds discovered yet. Be the first to establish one!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {guilds.map((guild, index) => (
                  <GuildGateCard
                    key={guild.id}
                    guild={guild}
                    onJoin={() => joinGuild(guild.id)}
                    isInGuild={!!myGuild}
                    isMyGuild={myGuild?.id === guild.id}
                    index={index}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Guild */}
          <TabsContent value="my-guild" className="mt-6 space-y-6">
            {!myGuild ? (
              <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-background">
                <CardContent className="py-16 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Castle className="h-24 w-24 mx-auto mb-4 text-primary/30" />
                  </motion.div>
                  <h3 className="text-2xl font-orbitron font-semibold mb-2">No Guild Yet</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Join an existing guild or establish your own!
                  </p>
                  <Button onClick={() => setActiveTab('browse')} className="bg-primary hover:bg-primary/90">
                    Browse Guild Gates
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Guild Banner */}
                <GuildBanner 
                  guild={myGuild} 
                  membership={myMembership}
                  memberCount={guildMembers.length}
                  canInvite={canInvite}
                  onInvite={() => setInviteModalOpen(true)}
                  onManageInvites={() => setManageInvitesOpen(true)}
                  sentInvitesCount={sentInvites.length}
                  onLeave={() => setConfirmLeave(true)}
                  onDisband={() => setConfirmDisband(true)}
                />

                {/* Members and Chat */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Party Members Panel */}
                  <Card className="border-primary/30 bg-gradient-to-br from-card/90 via-card/70 to-primary/5 overflow-hidden">
                    <CardHeader className="border-b border-primary/20 bg-primary/5">
                      <CardTitle className="text-lg font-orbitron flex items-center gap-3 text-primary">
                        <Users className="h-5 w-5" />
                        Party Members
                        <Badge variant="outline" className="ml-auto border-primary/50 text-primary">
                          {guildMembers.length}/{myGuild.max_members}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[350px]">
                        <div className="p-4 space-y-2">
                          {guildMembers.map((member) => (
                            <MemberCard 
                              key={member.id}
                              member={member}
                              isGuildMaster={myMembership?.role === 'guild_master'}
                              currentUserId={user.id}
                              onViewProfile={() => setSelectedMember(member)}
                              onManage={() => setManageMemberModal(member)}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* System Chat Panel */}
                  <Card className="border-violet-500/30 bg-gradient-to-br from-card/90 via-card/70 to-violet-500/5 overflow-hidden">
                    <CardHeader className="border-b border-violet-500/20 bg-violet-500/5">
                      <CardTitle className="text-lg font-orbitron flex items-center gap-3 text-violet-400">
                        <MessageSquare className="h-5 w-5" />
                        System Messages
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col h-[350px] p-0">
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-3">
                          {guildMessages.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                              <p>No messages yet. Start the conversation!</p>
                            </div>
                          ) : (
                            guildMessages.map((msg) => {
                              const isMe = msg.user_id === user.id;
                              return (
                                <div
                                  key={msg.id}
                                  className={`p-3 rounded-lg border ${
                                    isMe
                                      ? 'bg-primary/10 border-primary/30 ml-6'
                                      : 'bg-violet-500/10 border-violet-500/20 mr-6'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-orbitron ${isMe ? 'text-primary' : 'text-violet-400'}`}>
                                      {msg.sender_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-sm">{msg.message}</p>
                                </div>
                              );
                            })
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
                      
                      <div className="flex gap-2 p-4 border-t border-violet-500/20 bg-violet-500/5">
                        <Input
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="[SYSTEM] Enter message..."
                          className="bg-background/50 border-violet-500/30 focus:border-violet-500"
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          size="icon"
                          className="bg-violet-500 hover:bg-violet-600"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Guild Challenges */}
                <GuildChallengesPanel guildId={myGuild.id} isLeader={myMembership?.role === 'guild_master' || myMembership?.role === 'vice_master'} />
              </>
            )}
          </TabsContent>

          {/* Guild Rankings */}
          <TabsContent value="rankings" className="mt-6">
            <Card className="border-yellow-500/30 bg-gradient-to-br from-card/90 via-card/70 to-yellow-500/5 overflow-hidden">
              <CardHeader className="border-b border-yellow-500/20 bg-yellow-500/5">
                <CardTitle className="font-orbitron flex items-center gap-3 text-yellow-400">
                  <Trophy className="h-6 w-6" />
                  Guild Power Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    {guilds.slice(0, 20).map((guild, index) => (
                      <RankingEntry 
                        key={guild.id} 
                        guild={guild} 
                        rank={index + 1} 
                        isMyGuild={myGuild?.id === guild.id}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Guild Modal */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="border-primary/50 bg-gradient-to-br from-card via-card to-primary/10 backdrop-blur-sm overflow-hidden">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-primary/50" />
            <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-primary/50" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-primary/50" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-primary/50" />
            
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 font-orbitron text-xl">
                <Castle className="h-6 w-6 text-primary" />
                <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                  Establish Your Guild
                </span>
              </DialogTitle>
              <DialogDescription>
                Create your guild and recruit hunters to join your cause.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">Guild Name</label>
                <Input
                  value={guildName}
                  onChange={(e) => setGuildName(e.target.value)}
                  placeholder="Enter guild name..."
                  className="bg-background/50 border-primary/30 focus:border-primary"
                  maxLength={30}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">Description</label>
                <Textarea
                  value={guildDescription}
                  onChange={(e) => setGuildDescription(e.target.value)}
                  placeholder="Describe your guild..."
                  className="bg-background/50 border-primary/30 focus:border-primary resize-none"
                  rows={3}
                  maxLength={200}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">Access Type</label>
                <Select value={accessType} onValueChange={(v: any) => setAccessType(v)}>
                  <SelectTrigger className="bg-background/50 border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-400" />
                        Public - Anyone can join
                      </div>
                    </SelectItem>
                    <SelectItem value="invite_only">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-yellow-400" />
                        Invite Only - Requires invitation
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateGuild} 
                disabled={!guildName.trim()}
                className="bg-gradient-to-r from-primary to-cyan-500"
              >
                <Castle className="h-4 w-4 mr-2" />
                Establish Guild
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Leave Modal */}
        <Dialog open={confirmLeave} onOpenChange={setConfirmLeave}>
          <DialogContent className="border-destructive/30">
            <DialogHeader>
              <DialogTitle>Leave Guild?</DialogTitle>
              <DialogDescription>
                Are you sure you want to leave {myGuild?.name}? You'll lose your contribution progress.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmLeave(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  leaveGuild();
                  setConfirmLeave(false);
                }}
              >
                Leave Guild
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Disband Modal */}
        <Dialog open={confirmDisband} onOpenChange={setConfirmDisband}>
          <DialogContent className="border-destructive/30">
            <DialogHeader>
              <DialogTitle>Disband Guild?</DialogTitle>
              <DialogDescription>
                This will permanently delete {myGuild?.name} and remove all members. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDisband(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  disbandGuild();
                  setConfirmDisband(false);
                }}
              >
                Disband Guild
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hunter Profile Modal */}
        <HunterProfileModal
          open={!!selectedMember}
          onOpenChange={(open) => !open && setSelectedMember(null)}
          userId={selectedMember?.user_id || ''}
          hunterName={selectedMember?.hunter_name || ''}
        />

        {/* Invite Hunter Modal */}
        <Dialog open={inviteModalOpen} onOpenChange={(open) => {
          setInviteModalOpen(open);
          if (!open) {
            setSearchQuery('');
            setSearchResults([]);
          }
        }}>
          <DialogContent className="border-primary/30 bg-card/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-orbitron">
                <UserPlus className="h-5 w-5 text-primary" />
                Invite Hunter to Guild
              </DialogTitle>
              <DialogDescription>
                Search for hunters by name to invite them to {myGuild?.name}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Hunter Name</label>
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Enter hunter name..."
                  className="bg-background/50"
                />
              </div>
              
              <ScrollArea className="h-[250px] pr-4">
                {searching ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-14" />
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery.length < 2 
                      ? 'Type at least 2 characters to search' 
                      : 'No hunters found'
                    }
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div
                        key={result.user_id}
                        className="flex items-center justify-between p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <HunterAvatar 
                            avatar={result.avatar} 
                            hunterName={result.hunter_name} 
                            size="sm"
                          />
                          <span className="font-medium">{result.hunter_name}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleInvite(result.user_id, result.hunter_name)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Invite
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Member Modal */}
        <Dialog open={!!manageMemberModal} onOpenChange={() => setManageMemberModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Manage Member
              </DialogTitle>
              <DialogDescription>
                Manage {manageMemberModal?.hunter_name}'s role in the guild.
              </DialogDescription>
            </DialogHeader>
            
            {manageMemberModal && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-background/30">
                  <HunterAvatar 
                    avatar={manageMemberModal.avatar} 
                    hunterName={manageMemberModal.hunter_name || 'Unknown'} 
                    size="md"
                  />
                  <div>
                    <p className="font-semibold">{manageMemberModal.hunter_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Lv. {manageMemberModal.level} • {manageMemberModal.power} PWR
                    </p>
                    <Badge variant="outline" className={`mt-1 ${ROLE_COLORS[manageMemberModal.role]}`}>
                      {ROLE_LABELS[manageMemberModal.role]}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Actions</p>
                  <div className="grid gap-2">
                    {manageMemberModal.role !== 'vice_master' && (
                      <Button
                        variant="outline"
                        className="w-full justify-start border-green-500/50 text-green-400 hover:bg-green-500/10"
                        onClick={async () => {
                          await promoteMember(manageMemberModal.id, manageMemberModal.role);
                          setManageMemberModal(null);
                        }}
                      >
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Promote to {manageMemberModal.role === 'member' ? 'Elite' : 'Vice Master'}
                      </Button>
                    )}
                    {manageMemberModal.role !== 'member' && (
                      <Button
                        variant="outline"
                        className="w-full justify-start border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                        onClick={async () => {
                          await demoteMember(manageMemberModal.id, manageMemberModal.role);
                          setManageMemberModal(null);
                        }}
                      >
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Demote to {manageMemberModal.role === 'vice_master' ? 'Elite' : 'Member'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full justify-start border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={async () => {
                        await kickMember(manageMemberModal.id, manageMemberModal.user_id);
                        setManageMemberModal(null);
                      }}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Kick from Guild
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setManageMemberModal(null)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Invites Modal */}
        <Dialog open={manageInvitesOpen} onOpenChange={setManageInvitesOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-yellow-400" />
                Pending Invites
              </DialogTitle>
              <DialogDescription>
                Manage pending invites for {myGuild?.name}. Invites expire after 48 hours.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {sentInvites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No pending invites</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {sentInvites.map((invite) => {
                      const expiresAt = new Date(invite.expires_at);
                      const hoursLeft = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)));
                      
                      return (
                        <div
                          key={invite.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-background/30"
                        >
                          <div>
                            <p className="font-medium">{invite.invitee_name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires in {hoursLeft}h
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive/50 text-destructive hover:bg-destructive/10"
                            onClick={() => revokeInvite(invite.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setManageInvitesOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
};

// Guild Gate Card - Solo Leveling style
const GuildGateCard = ({
  guild,
  onJoin,
  isInGuild,
  isMyGuild,
  index,
}: {
  guild: Guild;
  onJoin: () => void;
  isInGuild: boolean;
  isMyGuild: boolean;
  index: number;
}) => {
  const powerTier = getPowerTier(guild.total_power);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`relative overflow-hidden border-2 ${powerTier.borderColor} ${powerTier.glow} bg-gradient-to-br from-card/90 via-card/70 to-background hover:scale-[1.02] transition-all duration-300 ${
        isMyGuild ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
      }`}>
        {/* Corner cuts effect */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary/50" />
        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary/50" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary/50" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary/50" />
        
        {/* Power tier indicator glow */}
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${powerTier.color}`} />
        
        <CardHeader className="pb-2 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${powerTier.color}`}>
                <Castle className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg font-orbitron">{guild.name}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {ACCESS_ICONS[guild.access_type]}
              {isMyGuild && (
                <Badge className="bg-primary/20 text-primary border-primary/50">
                  Your Guild
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="line-clamp-2 mt-2">
            {guild.description || 'No description'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative">
          {/* Power Display */}
          <div className="mb-4 p-3 rounded-lg bg-background/50 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Guild Power</span>
              <span className={`font-orbitron font-bold text-lg bg-gradient-to-r ${powerTier.color} bg-clip-text text-transparent`}>
                {guild.total_power.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={Math.min((guild.total_power / 10000) * 100, 100)} 
              className="h-2"
            />
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-cyan-400" />
                <span>{guild.member_count}/{guild.max_members}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-yellow-400" />
                <span className="text-muted-foreground">{guild.master_name}</span>
              </div>
            </div>
          </div>
          
          {/* Action */}
          <div className="flex justify-end">
            {!isInGuild && guild.access_type === 'public' && (
              <Button 
                size="sm" 
                onClick={onJoin}
                className={`bg-gradient-to-r ${powerTier.color} hover:opacity-90`}
              >
                <Swords className="h-4 w-4 mr-1" />
                Join Guild
              </Button>
            )}
            {guild.access_type === 'invite_only' && !isMyGuild && (
              <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">
                <UserPlus className="h-3 w-3 mr-1" />
                Invite Only
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Guild Banner Component
const GuildBanner = ({
  guild,
  membership,
  memberCount,
  canInvite,
  onInvite,
  onManageInvites,
  sentInvitesCount,
  onLeave,
  onDisband,
}: {
  guild: Guild;
  membership: any;
  memberCount: number;
  canInvite: boolean;
  onInvite: () => void;
  onManageInvites: () => void;
  sentInvitesCount: number;
  onLeave: () => void;
  onDisband: () => void;
}) => {
  const powerTier = getPowerTier(guild.total_power);
  
  return (
    <Card className={`relative overflow-hidden border-2 ${powerTier.borderColor} ${powerTier.glow}`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${powerTier.color}`} />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
      
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-primary/50" />
      <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-primary/50" />
      <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-primary/50" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-primary/50" />
      
      <CardContent className="relative py-8">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Guild Emblem */}
          <motion.div 
            className={`p-6 rounded-2xl bg-gradient-to-br ${powerTier.color} shadow-lg`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Castle className="h-16 w-16 text-white drop-shadow-lg" />
          </motion.div>
          
          {/* Guild Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
              <h2 className={`text-3xl font-orbitron font-bold bg-gradient-to-r ${powerTier.color} bg-clip-text text-transparent`}>
                {guild.name}
              </h2>
              {ACCESS_ICONS[guild.access_type]}
            </div>
            <p className="text-muted-foreground mb-4 max-w-xl">
              {guild.description || 'No description set'}
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 border border-primary/20">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-orbitron text-lg text-primary">{guild.total_power.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">POWER</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 border border-cyan-500/20">
                <Users className="h-5 w-5 text-cyan-400" />
                <span className="font-medium">{memberCount}/{guild.max_members}</span>
                <span className="text-xs text-muted-foreground">MEMBERS</span>
              </div>
              <Badge className={`px-4 py-2 ${ROLE_COLORS[membership?.role || 'member']}`}>
                {membership?.role === 'guild_master' && <Crown className="h-4 w-4 mr-1" />}
                {membership?.role === 'vice_master' && <Shield className="h-4 w-4 mr-1" />}
                {membership?.role === 'elite' && <Swords className="h-4 w-4 mr-1" />}
                {ROLE_LABELS[membership?.role || 'member']}
              </Badge>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col gap-2">
            {canInvite && (
              <>
                <Button
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary/10"
                  onClick={onInvite}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Hunter
                </Button>
                {sentInvitesCount > 0 && (
                  <Button
                    variant="outline"
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                    onClick={onManageInvites}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Invites ({sentInvitesCount})
                  </Button>
                )}
              </>
            )}
            {membership?.role !== 'guild_master' ? (
              <Button
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={onLeave}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave
              </Button>
            ) : (
              <Button
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={onDisband}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Disband
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Member Card Component
const MemberCard = ({
  member,
  isGuildMaster,
  currentUserId,
  onViewProfile,
  onManage,
}: {
  member: GuildMember;
  isGuildMaster: boolean;
  currentUserId: string;
  onViewProfile: () => void;
  onManage: () => void;
}) => {
  const roleConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    guild_master: { icon: <Crown className="h-4 w-4" />, color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50' },
    vice_master: { icon: <Shield className="h-4 w-4" />, color: 'text-violet-400 bg-violet-500/20 border-violet-500/50' },
    elite: { icon: <Swords className="h-4 w-4" />, color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50' },
    member: { icon: <Star className="h-4 w-4" />, color: 'text-slate-400 bg-slate-500/20 border-slate-500/50' },
  };
  
  const config = roleConfig[member.role] || roleConfig.member;
  
  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-all group border border-transparent hover:border-primary/20"
    >
      <div 
        className="flex items-center gap-3 flex-1 cursor-pointer"
        onClick={onViewProfile}
      >
        <HunterAvatar 
          avatar={member.avatar} 
          hunterName={member.hunter_name || 'Unknown'} 
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{member.hunter_name}</p>
            {member.user_id === currentUserId && (
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">You</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Lv. {member.level}</span>
            <span>•</span>
            <span className="text-primary">{member.power} PWR</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isGuildMaster && member.role !== 'guild_master' && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); onManage(); }}
          >
            <Users className="h-4 w-4" />
          </Button>
        )}
        <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
          {config.icon}
          <span className="hidden sm:inline">{ROLE_LABELS[member.role]}</span>
        </Badge>
      </div>
    </div>
  );
};

// Ranking Entry Component
const RankingEntry = ({
  guild,
  rank,
  isMyGuild,
}: {
  guild: Guild;
  rank: number;
  isMyGuild: boolean;
}) => {
  const powerTier = getPowerTier(guild.total_power);
  
  const getRankStyle = () => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/30 via-amber-500/20 to-transparent border-l-4 border-yellow-400';
    if (rank === 2) return 'bg-gradient-to-r from-slate-400/30 via-gray-400/20 to-transparent border-l-4 border-slate-400';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/30 via-orange-500/20 to-transparent border-l-4 border-amber-600';
    return '';
  };
  
  const getRankColor = () => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-slate-300';
    if (rank === 3) return 'text-amber-500';
    return 'text-muted-foreground';
  };
  
  return (
    <div className={`flex items-center justify-between p-4 ${getRankStyle()} ${isMyGuild ? 'ring-2 ring-inset ring-primary' : ''}`}>
      <div className="flex items-center gap-4">
        <span className={`font-orbitron font-bold w-10 text-lg ${getRankColor()}`}>
          {rank <= 3 ? (
            <Trophy className={`h-6 w-6 ${getRankColor()}`} />
          ) : (
            `#${rank}`
          )}
        </span>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${powerTier.color}`}>
          <Castle className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-orbitron font-semibold">{guild.name}</p>
            {isMyGuild && (
              <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                Your Guild
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {guild.member_count} members • Master: {guild.master_name}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-orbitron font-bold text-lg bg-gradient-to-r ${powerTier.color} bg-clip-text text-transparent`}>
          {guild.total_power.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">Power</p>
      </div>
    </div>
  );
};

export default Guilds;
