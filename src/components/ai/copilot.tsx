"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { AISuggestion } from "@/types";
import {
  Sparkles,
  Mail,
  FileText,
  AlertTriangle,
  Send,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AICopilotProps {
  suggestions: AISuggestion[];
  onExecuteAction: (suggestion: AISuggestion) => Promise<string>;
  isLoading?: boolean;
}

export function AICopilot({ suggestions, onExecuteAction, isLoading }: AICopilotProps) {
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const getActionIcon = (action: string) => {
    if (action.includes("email")) return <Mail className="h-4 w-4" />;
    if (action.includes("risk") || action.includes("analysis")) return <AlertTriangle className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const handleExecute = async (suggestion: AISuggestion) => {
    setLoadingAction(suggestion.id);
    setExpandedSuggestion(suggestion.id);
    try {
      const result = await onExecuteAction(suggestion);
      setGeneratedContent((prev) => ({ ...prev, [suggestion.id]: result }));
    } catch (error) {
      console.error("AI generation error:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Assistant IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Wand2 className="h-8 w-8 mx-auto mb-2 text-purple-400" />
            <p className="text-sm">Aucune suggestion pour le moment</p>
            <p className="text-xs">Les suggestions apparaîtront selon le contexte</p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="rounded-lg border bg-white p-3 space-y-2"
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded bg-purple-100 text-purple-600">
                  {getActionIcon(suggestion.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{suggestion.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.description}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Priorité {suggestion.priority}
                </Badge>
              </div>

              {!generatedContent[suggestion.id] && (
                <Button
                  size="sm"
                  className="w-full"
                  variant="outline"
                  onClick={() => handleExecute(suggestion)}
                  disabled={loadingAction === suggestion.id}
                >
                  {loadingAction === suggestion.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Générer
                    </>
                  )}
                </Button>
              )}

              {generatedContent[suggestion.id] && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-green-600">
                      ✓ Contenu généré
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() =>
                        setExpandedSuggestion(
                          expandedSuggestion === suggestion.id ? null : suggestion.id
                        )
                      }
                    >
                      {expandedSuggestion === suggestion.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {expandedSuggestion === suggestion.id && (
                    <div className="space-y-2">
                      <Textarea
                        value={generatedContent[suggestion.id]}
                        onChange={(e) =>
                          setGeneratedContent((prev) => ({
                            ...prev,
                            [suggestion.id]: e.target.value,
                          }))
                        }
                        className="min-h-[150px] text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            handleCopy(suggestion.id, generatedContent[suggestion.id])
                          }
                        >
                          {copied === suggestion.id ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copié !
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copier
                            </>
                          )}
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Send className="h-4 w-4 mr-2" />
                          Envoyer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
