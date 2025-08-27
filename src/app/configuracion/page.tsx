'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

function SimpleSwitch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
        checked ? 'bg-primary border-primary' : 'bg-muted border-border'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export default function ConfiguracionPage() {
  const [profile, setProfile] = useState({
    nombre: '',
    email: '',
    avatarUrl: ''
  })

  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system')
  const [notifications, setNotifications] = useState({
    enabled: true,
    sound: false,
    doNotDisturb: false,
    dndFrom: '22:00',
    dndTo: '07:00'
  })

  const onSaveProfile = () => {
    alert('Perfil guardado')
  }

  const onSaveAppearance = () => {
    alert('Apariencia guardada')
  }

  const onSaveNotifications = () => {
    alert('Preferencias de notificaciones guardadas')
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Administra tu cuenta, apariencia y notificaciones</p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="cuenta">Cuenta</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Información de Perfil</CardTitle>
              <CardDescription>Actualiza tu nombre, correo y avatar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={profile.nombre} onChange={(e) => setProfile({ ...profile, nombre: e.target.value })} placeholder="Tu nombre" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="mi.amor@example.com" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="avatar">Avatar (URL)</Label>
                  <Input id="avatar" value={profile.avatarUrl} onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={onSaveProfile}>Guardar cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apariencia">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Elige cómo se ve la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tema</Label>
                <div className="mt-2 w-56">
                  <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">Sistema</SelectItem>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={onSaveAppearance}>Guardar apariencia</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Configura cómo y cuándo recibir avisos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Activar notificaciones</Label>
                <SimpleSwitch checked={notifications.enabled} onCheckedChange={(c) => setNotifications({ ...notifications, enabled: c })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Sonido</Label>
                <SimpleSwitch checked={notifications.sound} onCheckedChange={(c) => setNotifications({ ...notifications, sound: c })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>No molestar</Label>
                <SimpleSwitch checked={notifications.doNotDisturb} onCheckedChange={(c) => setNotifications({ ...notifications, doNotDisturb: c })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dndFrom">Desde</Label>
                  <Input id="dndFrom" type="time" value={notifications.dndFrom} onChange={(e) => setNotifications({ ...notifications, dndFrom: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="dndTo">Hasta</Label>
                  <Input id="dndTo" type="time" value={notifications.dndTo} onChange={(e) => setNotifications({ ...notifications, dndTo: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={onSaveNotifications}>Guardar preferencias</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cuenta">
          <Card>
            <CardHeader>
              <CardTitle>Cuenta</CardTitle>
              <CardDescription>Acciones sensibles y administración de cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cerrar sesión</p>
                  <p className="text-sm text-muted-foreground">Finaliza tu sesión actual</p>
                </div>
                <Button variant="outline" onClick={() => alert('Cerrar sesión')}>Cerrar sesión</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-600">Eliminar cuenta</p>
                  <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer</p>
                </div>
                <Button variant="destructive" onClick={() => confirm('¿Eliminar cuenta?') && alert('Cuenta eliminada')}>Eliminar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


