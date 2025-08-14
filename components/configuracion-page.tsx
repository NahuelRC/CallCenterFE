"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, Save, TestTube, AlertCircle, CheckCircle } from "lucide-react";

import {
  getTwilioConfig,
  saveTwilioConfig,
  testTwilioConnection,
  type TwilioConfigDTO,
} from "@/lib/twilioApi";

type ConnectionStatus = "connected" | "disconnected" | "testing";

// Helpers para mapear entre UI (E.164) y BE (whatsapp:+...)
const stripWhatsApp = (v?: string) =>
  (v?.startsWith("whatsapp:") ? v.replace(/^whatsapp:/, "") : v) || "";

const ensureE164 = (v: string) => v.trim().replace(/\s+/g, "");

const toWhatsAppFromE164 = (e164: string) =>
  e164.startsWith("whatsapp:") ? e164 : `whatsapp:${e164}`;

export function ConfiguracionPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [testTo, setTestTo] = useState("");

  // Mantenemos token enmascarado para ver; y un campo plain para cuando editás.
  const [twilioConfig, setTwilioConfig] = useState({
    accountSid: "",
    authTokenMasked: "",
    authTokenPlain: "", // se completa SOLO en edición
    fromNumber: "", // UI: E.164 (+549…)
    webhookUrl: "",
  });

  // Cargar desde el BE
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const cfg: TwilioConfigDTO = await getTwilioConfig();
        setTwilioConfig({
          accountSid: cfg.accountSid || "",
          authTokenMasked: cfg.authTokenMasked || "",
          authTokenPlain: "",
          // ✅ mostrar en la UI como E.164 (+549…)
          fromNumber: stripWhatsApp(cfg.fromNumber || ""),
          webhookUrl: cfg.webhookUrl || "",
        });
        const ok =
          !!cfg.accountSid && !!cfg.fromNumber && !!cfg.authTokenMasked;
        setConnectionStatus(ok ? "connected" : "disconnected");
      } catch (e) {
        console.error(e);
        setConnectionStatus("disconnected");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleSave = async () => {
    try {
      if (!twilioConfig.authTokenPlain.trim()) {
        alert("Pega tu Auth Token para guardar la configuración.");
        return;
      }

      const e164 = ensureE164(twilioConfig.fromNumber);
      if (!e164.startsWith("+")) {
        alert("El número debe estar en formato E.164 (ej: +549341XXXXXXX).");
        return;
      }

      const body = {
        accountSid: twilioConfig.accountSid.trim(),
        authToken: twilioConfig.authTokenPlain.trim(),
        // ✅ al BE se envía con prefijo whatsapp:
        fromNumber: toWhatsAppFromE164(e164),
        webhookUrl: twilioConfig.webhookUrl.trim(),
      };

      if (!body.accountSid || !body.authToken || !body.fromNumber) {
        alert("Faltan campos obligatorios (Account SID, Auth Token, Número).");
        return;
      }

      await saveTwilioConfig(body);

      // refrescar desde BE para volver a ver el token enmascarado
      const cfg = await getTwilioConfig();
      setTwilioConfig({
        accountSid: cfg.accountSid || "",
        authTokenMasked: cfg.authTokenMasked || "",
        authTokenPlain: "",
        fromNumber: stripWhatsApp(cfg.fromNumber || ""),
        webhookUrl: cfg.webhookUrl || "",
      });

      setIsEditing(false);
      setConnectionStatus("connected");
      alert("Configuración guardada ✅");
    } catch (e: any) {
      alert(e.message || "No se pudo guardar la configuración");
    }
  };

  const handleTestConnection = async () => {
    try {
      setConnectionStatus("testing");
      // En tu twilioApi.ts, asegúrate de enviar { testTo } al BE.
      const resp = await testTwilioConnection(testTo || undefined);
      if (resp.ok) {
        setConnectionStatus("connected");
        if (resp.messageSid) {
          alert(`Conexión OK. Mensaje SID: ${resp.messageSid}`);
        } else {
          alert("Conexión OK.");
        }
      } else {
        setConnectionStatus("disconnected");
        alert(`Falló la prueba: ${resp.error || "Error"}`);
      }
    } catch (e: any) {
      setConnectionStatus("disconnected");
      alert(e.message || "Error al probar la conexión");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-2">
          Configura las integraciones y ajustes del sistema
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Twilio */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Configuración de Twilio</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Configura tu cuenta de Twilio para envío de WhatsApp
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {connectionStatus === "connected" && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                )}
                {connectionStatus === "disconnected" && (
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-800"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Desconectado
                  </Badge>
                )}
                {connectionStatus === "testing" && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent"></div>
                    Probando...
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountSid">Account SID</Label>
                <Input
                  id="accountSid"
                  value={twilioConfig.accountSid}
                  onChange={(e) =>
                    setTwilioConfig((p) => ({
                      ...p,
                      accountSid: e.target.value,
                    }))
                  }
                  disabled={!isEditing || loading}
                  className="font-mono text-sm"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tu Account SID de Twilio
                </p>
              </div>

              <div>
                <Label htmlFor="authToken">Auth Token</Label>
                <Input
                  id="authToken"
                  type={isEditing ? "text" : "password"}
                  value={
                    isEditing
                      ? twilioConfig.authTokenPlain
                      : twilioConfig.authTokenMasked
                  }
                  onChange={(e) =>
                    setTwilioConfig((p) => ({
                      ...p,
                      authTokenPlain: e.target.value,
                    }))
                  }
                  disabled={!isEditing || loading}
                  className="font-mono text-sm"
                  placeholder={isEditing ? "Pega aquí tu Auth Token" : "••••••••••••••••"}
                />
                <p className="text-xs text-gray-500 mt-1">
                  En edición debes pegar el token en claro para poder guardarlo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromNumber">Número de WhatsApp de Twilio (E.164)</Label>
                <Input
                  id="fromNumber"
                  value={twilioConfig.fromNumber}
                  onChange={(e) =>
                    setTwilioConfig((p) => ({ ...p, fromNumber: e.target.value }))
                  }
                  disabled={!isEditing || loading}
                  placeholder="+549341XXXXXXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Escribe solo en formato E.164 (ej: <code>+549341...</code>).
                  Se guardará como <code>whatsapp:+...</code>.
                </p>
              </div>

              <div>
                <Label htmlFor="webhookUrl">Webhook URL (informativo)</Label>
                <Input
                  id="webhookUrl"
                  value={twilioConfig.webhookUrl}
                  onChange={(e) =>
                    setTwilioConfig((p) => ({
                      ...p,
                      webhookUrl: e.target.value,
                    }))
                  }
                  disabled={!isEditing || loading}
                  placeholder="https://tu-backend.com/webhook"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL donde Twilio entrega mensajes entrantes.
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-3 pt-4 border-t">
              {!isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(true)} disabled={loading}>
                    Editar Configuración
                  </Button>

                  <div className="ml-auto flex items-center gap-2">
                    <Input
                      className="w-64"
                      placeholder="Número de prueba (+549...)"
                      value={testTo}
                      onChange={(e) => setTestTo(e.target.value)}
                      disabled={connectionStatus === "testing"}
                    />
                    <Button
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={connectionStatus === "testing"}
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      Probar Conexión
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button onClick={handleSave} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      // limpiar el token en claro si cancelás
                      setTwilioConfig((p) => ({ ...p, authTokenPlain: "" }));
                    }}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Otros ajustes (de ejemplo) */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
            <p className="text-sm text-gray-600">Ajustes generales del sistema</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ...otros campos que quieras agregar */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
