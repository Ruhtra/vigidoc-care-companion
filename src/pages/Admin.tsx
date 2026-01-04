import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Shield, 
  Users, 
  Activity, 
  Calendar, 
  Search, 
  Download,
  ChevronDown,
  ChevronUp,
  Heart,
  Thermometer,
  Droplets,
  Scale,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAdminData } from "@/hooks/useAdminData";
import { useAuth } from "@/hooks/useAuth";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { patients, isLoading, error, isAdmin, refetch } = useAdminData();
  
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPatients, setExpandedPatients] = useState<Set<string>>(new Set());

  const handleFilter = () => {
    refetch(dateFrom || undefined, dateTo || undefined);
  };

  const handleClearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
    refetch();
  };

  const togglePatientExpanded = (patientId: string) => {
    setExpandedPatients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(patientId)) {
        newSet.delete(patientId);
      } else {
        newSet.add(patientId);
      }
      return newSet;
    });
  };

  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      patient.full_name?.toLowerCase().includes(search) ||
      patient.phone?.toLowerCase().includes(search)
    );
  });

  const exportToCSV = () => {
    const rows: string[] = [];
    rows.push("Paciente,Telefone,Data Nascimento,Data Registro,Sistólica,Diastólica,FC,Temperatura,SpO2,Peso,Dor");
    
    filteredPatients.forEach(patient => {
      if (patient.vitals && patient.vitals.length > 0) {
        patient.vitals.forEach(vital => {
          rows.push([
            patient.full_name || "Sem nome",
            patient.phone || "-",
            patient.birth_date || "-",
            format(new Date(vital.recorded_at), "dd/MM/yyyy HH:mm"),
            vital.systolic?.toString() || "-",
            vital.diastolic?.toString() || "-",
            vital.heart_rate?.toString() || "-",
            vital.temperature?.toString() || "-",
            vital.oxygen_saturation?.toString() || "-",
            vital.weight?.toString() || "-",
            vital.pain_level?.toString() || "-"
          ].join(","));
        });
      } else {
        rows.push([
          patient.full_name || "Sem nome",
          patient.phone || "-",
          patient.birth_date || "-",
          "-", "-", "-", "-", "-", "-", "-", "-"
        ].join(","));
      }
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pacientes_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const getTotalVitals = () => {
    return patients.reduce((acc, p) => acc + (p.vitals?.length || 0), 0);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (error || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Shield className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-4">
              {error || "Você não tem permissão para acessar o painel administrativo."}
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/")}
                className="text-primary-foreground hover:bg-primary/80"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  Painel Administrativo
                </h1>
                <p className="text-primary-foreground/80 text-sm">
                  Visualize e gerencie dados dos pacientes
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{patients.length}</p>
                  <p className="text-sm text-muted-foreground">Pacientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{getTotalVitals()}</p>
                  <p className="text-sm text-muted-foreground">Registros</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {format(new Date(), "dd/MM", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-muted-foreground">Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <Button onClick={exportToCSV} className="w-full h-full" variant="outline">
                <Download className="h-5 w-5 mr-2" />
                Exportar CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Buscar paciente</label>
                <Input
                  placeholder="Nome ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Data inicial</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Data final</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleFilter} className="flex-1">
                  Filtrar
                </Button>
                <Button onClick={handleClearFilters} variant="outline">
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pacientes ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum paciente encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <Collapsible
                    key={patient.id}
                    open={expandedPatients.has(patient.id)}
                    onOpenChange={() => togglePatientExpanded(patient.id)}
                  >
                    <Card className="border">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">
                                  {patient.full_name || "Sem nome"}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  {patient.phone && <span>{patient.phone}</span>}
                                  {patient.birth_date && (
                                    <span>
                                      Nasc: {format(new Date(patient.birth_date), "dd/MM/yyyy")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary">
                                {patient.vitals?.length || 0} registros
                              </Badge>
                              {expandedPatients.has(patient.id) ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          {patient.medical_notes && (
                            <div className="mb-4 p-3 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground font-medium mb-1">
                                Notas médicas:
                              </p>
                              <p className="text-sm">{patient.medical_notes}</p>
                            </div>
                          )}
                          
                          {patient.vitals && patient.vitals.length > 0 ? (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>
                                      <div className="flex items-center gap-1">
                                        <Heart className="h-4 w-4 text-red-500" />
                                        PA
                                      </div>
                                    </TableHead>
                                    <TableHead>
                                      <div className="flex items-center gap-1">
                                        <Activity className="h-4 w-4 text-pink-500" />
                                        FC
                                      </div>
                                    </TableHead>
                                    <TableHead>
                                      <div className="flex items-center gap-1">
                                        <Thermometer className="h-4 w-4 text-orange-500" />
                                        Temp
                                      </div>
                                    </TableHead>
                                    <TableHead>
                                      <div className="flex items-center gap-1">
                                        <Droplets className="h-4 w-4 text-blue-500" />
                                        SpO2
                                      </div>
                                    </TableHead>
                                    <TableHead>
                                      <div className="flex items-center gap-1">
                                        <Scale className="h-4 w-4 text-green-500" />
                                        Peso
                                      </div>
                                    </TableHead>
                                    <TableHead>
                                      <div className="flex items-center gap-1">
                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                        Dor
                                      </div>
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {patient.vitals.slice(0, 10).map((vital) => (
                                    <TableRow key={vital.id}>
                                      <TableCell className="font-medium">
                                        {format(new Date(vital.recorded_at), "dd/MM HH:mm")}
                                      </TableCell>
                                      <TableCell>
                                        {vital.systolic && vital.diastolic 
                                          ? `${vital.systolic}/${vital.diastolic}` 
                                          : "-"}
                                      </TableCell>
                                      <TableCell>
                                        {vital.heart_rate ? `${vital.heart_rate} bpm` : "-"}
                                      </TableCell>
                                      <TableCell>
                                        {vital.temperature ? `${vital.temperature}°C` : "-"}
                                      </TableCell>
                                      <TableCell>
                                        {vital.oxygen_saturation ? `${vital.oxygen_saturation}%` : "-"}
                                      </TableCell>
                                      <TableCell>
                                        {vital.weight ? `${vital.weight} kg` : "-"}
                                      </TableCell>
                                      <TableCell>
                                        {vital.pain_level !== null ? vital.pain_level : "-"}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              {patient.vitals.length > 10 && (
                                <p className="text-sm text-muted-foreground text-center mt-2">
                                  Mostrando 10 de {patient.vitals.length} registros
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Nenhum registro de sinais vitais
                            </p>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
