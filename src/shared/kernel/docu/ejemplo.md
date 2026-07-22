A continuación te muestro una **estructura de archivos (y esqueleto de código)** que aplica DDD táctico a tu sistema de planificación. 

Para lograr esto, se utiliza una **Arquitectura Hexagonal (Puertos y Adaptadores)** o una arquitectura limpia por capas, separando claramente el **Dominio** (el corazón del negocio), la **Aplicación** (los casos de uso), la **Infraestructura** (BD, frameworks) y la **Presentación** (APIs).

Aquí tienes cómo se vería la jerarquía de carpetas:

```text
src/
└── main/
    └── java/
        └── com/
            └── sgt/
                ├── config/                           // Contexto: Configuración de catálogos
                │   ├── domain/                       // Capa de Dominio
                │   │   ├── entities/                 
                │   │   │   ├── Sector.java           // Entidad
                │   │   │   └── Turno.java            // Entidad (o Value Object si es fijo)
                │   │   └── repositories/
                │   │       └── ITurnoRepositorio.java // Interfaz del Repositorio
                │   └── infrastructure/               // Capa de Infraestructura (Implementaciones)
                │       └── TurnoRepositorioJpa.java
                │
                ├── staff/                            // Contexto: Personal
                │   ├── domain/
                │   │   ├── entities/
                │   │   │   ├── Empleado.java         // Entidad (Agregado Raíz del contexto Staff)
                │   │   │   └── TipoEmpleado.java     // Value Object
                │   │   ├── factories/
                │   │   │   └── EmpleadoFactory.java  // Fábrica para crear empleados complejos
                │   │   └── repositories/
                │   │       └── IEmpleadoRepositorio.java
                │   └── infrastructure/
                │       └── EmpleadoRepositorioJpa.java
                │
                ├── demand/                           // Contexto: Demanda (Necesidades)
                │   ├── domain/
                │   │   ├── entities/
                │   │   │   ├── DemandaOperativa.java // Entidad
                │   │   │   └── DemandaIndividual.java// Entidad
                │   │   └── repositories/
                │   │       └── IDemandaRepositorio.java
                │   └── infrastructure/
                │       └── DemandaRepositorioJpa.java
                │
                ├── scheduling/                       // ⭐ NÚCLEO DEL DOMINIO (Planificación) ⭐
                │   ├── domain/
                │   │   ├── aggregates/               // Los Agregados Raíz
                │   │   │   └── PlanificacionMensual.java // 🚨 Agregado Raíz
                │   │   ├── entities/                 // Entidades dentro del Agregado
                │   │   │   ├── Calendario.java
                │   │   │   ├── Semana.java
                │   │   │   ├── DiaPlanificado.java
                │   │   │   ├── Asignacion.java       // Entidad (tiene ID)
                │   │   │   ├── Ausencia.java         // Entidad
                │   │   │   └── Reemplazo.java        // Entidad
                │   │   ├── valueobjects/             // Objetos de Valor (inmutables)
                │   │   │   ├── EstadoPlanificacion.java // Enum (PROGRAMADO, etc.)
                │   │   │   ├── EstadoEvento.java
                │   │   │   ├── MotivoAusencia.java    // VO con validación (en lugar de String)
                │   │   │   └── RangoHorario.java
                │   │   ├── events/                   // 📣 Eventos de Dominio
                │   │   │   ├── TurnoAsignadoEvent.java
                │   │   │   └── AusenciaRegistradaEvent.java
                │   │   ├── services/                 // Servicios de Dominio (Sin estado)
                │   │   │   ├── Planificador.java     // El motor que orquesta la estrategia
                │   │   │   ├── IAsignarStrategy.java // Interfaz Strategy
                │   │   │   ├── GreedyStrategy.java   // Estrategia concreta
                │   │   │   ├── BalanceStrategy.java  // Estrategia concreta
                │   │   │   └── ManualStrategy.java   // Estrategia concreta
                │   │   ├── factories/                // Fábricas
                │   │   │   └── PlanificacionFactory.java // Crea el Agregado completo
                │   │   └── repositories/             // 📦 Interfaz del Repositorio
                │   │       └── IPlanificacionMensualRepositorio.java
                │   └── infrastructure/               // Capa de Infraestructura
                │       └── PlanificacionMensualRepositorioJpa.java
                │
                ├── operations/                        // Contexto: Eventos y Operaciones en vivo
                │   ├── domain/
                │   │   ├── entities/
                │   │   │   └── EventoLaboral.java
                │   │   └── events/
                │   │       ├── EmpleadoPresenteEvent.java
                │   │       └── EmpleadoAusenteEvent.java
                │   └── infrastructure/
                │       └── EventoLaboralRepositorioJpa.java
                │
                ├── application/                       // 🖥️ CAPA DE APLICACIÓN (Casos de Uso)
                │   ├── services/
                │   │   ├── PlanificarTurnosService.java   // Orquesta el caso de uso "Planificar"
                │   │   ├── RegistrarAusenciaService.java  // Orquesta el caso de uso "Registrar ausencia"
                │   │   └── GestionarReemplazosService.java
                │   ├── dtos/                          // Objetos de transferencia de datos (Input/Output)
                │   │   ├── SolicitudPlanificacionDTO.java
                │   │   └── ResultadoPlanificacionDTO.java
                │   └── eventsubscribers/             // Oyentes de Eventos de Dominio
                │       └── AusenciaListener.java     // Reacciona a AusenciaRegistradaEvent
                │
                └── interfaces/                        // 🌐 CAPA DE PRESENTACIÓN (REST APIs)
                    └── rest/
                        ├── controllers/
                        │   └── PlanificacionController.java // Endpoint HTTP
                        └── config/
                            └── RestConfig.java
```

---

### 📂 ¿Qué contiene cada archivo clave? (Esqueleto de implementación)

Para que veas cómo aplicar los conceptos, aquí tienes un extracto de cómo se escribirían las clases clave:

#### 1. El Agregado Raíz (Scheduling) con Comportamiento
El corazón del sistema. **No tiene setters públicos**. Solo expone métodos de negocio.

```java
// scheduling/domain/aggregates/PlanificacionMensual.java
public class PlanificacionMensual {
    private UUID id;
    private String mesAnio;
    private EstadoPlanificacion estado;
    private List<Semana> semanas; // Contiene Días y Asignaciones

    // Comportamiento de negocio (Regla de consistencia)
    public void asignarTurno(EmpleadoId empleadoId, LocalDate fecha, TurnoId turnoId) {
        // 1. Validar que el empleado no tenga otro turno ese día
        // 2. Validar que el empleado no esté de vacaciones
        // 3. Ejecutar la asignación en el DiaPlanificado correspondiente
        this.obtenerDia(fecha).asignar(empleadoId, turnoId);
        
        // 4. Disparar un Evento de Dominio
        this.addDomainEvent(new TurnoAsignadoEvent(this.id, empleadoId, fecha, turnoId));
    }

    public void registrarAusencia(EmpleadoId empleadoId, LocalDate fecha, MotivoAusencia motivo) {
        this.obtenerDia(fecha).agregarAusencia(empleadoId, motivo);
        this.addDomainEvent(new AusenciaRegistradaEvent(this.id, empleadoId, fecha, motivo));
    }
    
    // ... getters para lectura (protegidos), sin setters.
}
```

#### 2. El Servicio de Dominio (Planificador + Estrategia)
La lógica algorítmica no se mete en el Agregado, porque no es responsabilidad de la Planificación saber *cómo calcular*, sino *almacenar los resultados*.

```java
// scheduling/domain/services/Planificador.java
public class Planificador {
    
    public void planificar(PlanificacionMensual planificacion, IAsignarStrategy estrategia) {
        // Obtener datos de Demanda y Empleados (a través del Repositorio o Servicio de Aplicación)
        // Orquestar el algoritmo de la estrategia
        estrategia.asignar(planificacion);
    }
}

// scheduling/domain/services/GreedyStrategy.java
public class GreedyStrategy implements IAsignarStrategy {
    @Override
    public void asignar(PlanificacionMensual planificacion) {
        // Lógica compleja para cubrir la demanda de forma voraz.
        // Llama internamente a planificacion.asignarTurno(...)
    }
}
```

#### 3. La Fábrica (Factory)
Se asegura de que el Agregado siempre se cree en un estado válido desde el principio.

```java
// scheduling/domain/factories/PlanificacionFactory.java
public class PlanificacionFactory {
    
    public PlanificacionMensual crearPlanificacion(int anio, int mes, List<DemandaOperativa> demandas) {
        PlanificacionMensual planificacion = new PlanificacionMensual(anio, mes);
        planificacion.crearCalendario();
        
        // Llenar los días con las demandas operativas
        for(DemandaOperativa demanda : demandas) {
            planificacion.vincularDemanda(demanda);
        }
        
        return planificacion;
    }
}
```

#### 4. El Repositorio (Puerto y Adaptador)
El **Puerto** (interfaz) vive en la capa de Dominio. El **Adaptador** (implementación concreto con JPA/Hibernate) vive en Infraestructura. Esto mantiene tu Dominio puro (sin anotaciones de BD).

```java
// scheduling/domain/repositories/IPlanificacionMensualRepositorio.java
public interface IPlanificacionMensualRepositorio {
    PlanificacionMensual buscarPorId(UUID id);
    void guardar(PlanificacionMensual planificacion);
    // Solo Agregados Raíz tienen repositorio. No buscas por "DiaPlanificado".
}

// scheduling/infrastructure/PlanificacionMensualRepositorioJpa.java
@Repository
public class PlanificacionMensualRepositorioJpa implements IPlanificacionMensualRepositorio {
    // Implementación real con JPA (Spring Data o Jakarta Persistence)
}
```

#### 5. El Servicio de Aplicación (Caso de Uso)
Esta capa **no tiene lógica de negocio**. Solo orquesta el flujo: Recibe peticiones de la API, llama a la Fábrica y al Servicio de Dominio, y persiste con el Repositorio.

```java
// application/services/PlanificarTurnosService.java
@Service
public class PlanificarTurnosService {
    
    private final IPlanificacionMensualRepositorio repositorio;
    private final Planificador planificador;
    private final IAsignarStrategy estrategiaPorDefecto;

    public void ejecutarPlanificacion(int anio, int mes) {
        // 1. Obtener demandas desde infraestructura (otro repositorio)
        // 2. Crear el Agregado vacío usando la Factory
        PlanificacionMensual nuevaPlanificacion = factory.crearPlanificacion(anio, mes, demandas);
        
        // 3. Ejecutar el algoritmo del motor (Servicio de Dominio)
        planificador.planificar(nuevaPlanificacion, estrategiaPorDefecto);
        
        // 4. Persistir
        repositorio.guardar(nuevaPlanificacion);
        
        // 5. Publicar eventos de dominio si es necesario
        eventPublisher.publish(nuevaPlanificacion.getDomainEvents());
    }
}
```

### ✅ Resumen de buenas prácticas logradas en esta estructura:
1. **Lógica encapsulada:** La validación de turnos está en `PlanificacionMensual`, no desperdigada en controladores.
2. **Agregados pequeños y precisos:** `PlanificacionMensual` carga sus semanas y días, pero no carga los 200 empleados de la empresa (solo carga sus IDs en las `Asignacion`).
3. **Estrategias inyectables:** El motor de planificación es reemplazable (puedes cambiar entre `Greedy` y `Balance` sin tocar el resto del sistema).
4. **Desacoplamiento:** El Dominio no sabe nada de Spring, JPA ni REST. Todas las dependencias técnicas están en la capa de `infrastructure` y `interfaces`.
5. **Event Driven:** El sistema está preparado para reaccionar a ausencias de forma reactiva.


---

Aquí tienes un ejemplo completo de cómo se implementaría la clase `Usuario.ts` extendiendo la clase `Entity` que mostraste anteriormente, aplicando los conceptos de **DDD** (Entidad, Value Objects y tipado genérico).

### Estructura de archivos

#### 1. Definición de las Propiedades (`UsuarioProps`)
Primero, definimos la interfaz que representará el tipo **`T`**. En DDD, es común separar los datos puros de la lógica de la entidad.

```typescript
// UsuarioProps.ts
export interface UsuarioProps {
  nombre: string;
  email: string;
  edad: number;
  // Puedes agregar más campos según necesites
}
```

#### 2. Implementación de la Entidad (`Usuario.ts`)
Aquí es donde usamos `Entity<UsuarioProps>`. El genérico **`T`** se sustituye por `UsuarioProps`, dando seguridad de tipos a `this.props`.

```typescript
// Usuario.ts
import { Entity } from './Entity.js';
import { UniqueId } from '../UniqueId.js';
import { UsuarioProps } from './UsuarioProps.js';

export class Usuario extends Entity<UsuarioProps> {
  
  // El constructor recibe las props y un ID opcional
  constructor(props: UsuarioProps, id?: UniqueId) {
    super(props, id);
  }

  // Métodos de dominio (lógica de negocio)
  public cambiarEmail(nuevoEmail: string): void {
    // Aquí podrías agregar validaciones de dominio antes de asignar
    if (!nuevoEmail.includes('@')) {
      throw new Error("Email inválido");
    }
    // En DDD estricto, a veces se prefiere inmutabilidad o métodos específicos
    // en lugar de acceso directo a props, pero esto depende de tu arquitectura.
    // Si props es readonly, necesitarías un método para recrear la entidad o usar getters/setters internos.
    // Para este ejemplo, asumimos que podemos modificar o tenemos setters.
    
    // Nota: Si 'props' es readonly como en tu clase base, la forma correcta en DDD 
    // es a menudo crear una nueva instancia o tener métodos privados que modifiquen 
    // una copia. Sin embargo, si tu clase base permite mutación controlada:
    (this.props as any).email = nuevoEmail; 
  }

  public getNombre(): string {
    return this.props.nombre;
  }

  public getEmail(): string {
    return this.props.email;
  }

  public esMayorDeEdad(): boolean {
    return this.props.edad >= 18;
  }

  // Factory method (opcional pero recomendado en DDD)
  public static crear(nombre: string, email: string, edad: number, id?: UniqueId): Usuario {
    return new Usuario({ nombre, email, edad }, id);
  }
}
```

### Puntos Clave del Ejemplo

1.  **Tipado Genérico (`Entity<UsuarioProps>`)**: Al extender `Entity<UsuarioProps>`, TypeScript sabe automáticamente que `this.props` es de tipo `UsuarioProps`. Si intentas acceder a `this.props.datoInexistente`, el compilador lanzará un error.
2.  **Identidad (`_id`)**: La clase hereda el `_id` y el método `equals()`. Puedes comparar dos usuarios así:
    ```typescript
    const user1 = Usuario.crear("Ana", "ana@test.com", 25);
    const user2 = new Usuario({ nombre: "Ana", email: "ana@test.com", edad: 25 }, user1.id);
    
    console.log(user1.equals(user2)); // true (mismo ID, aunque sean instancias distintas)
    ```
3.  **Encapsulamiento**: Los métodos como `cambiarEmail` o `esMayorDeEdad` protegen la lógica de negocio dentro de la entidad, en lugar de tener lógica anémica (solo datos) en los componentes de la UI o servicios.
4.  **Factory Method**: El método estático `crear` simplifica la instanciación y centraliza la lógica de creación inicial.

---

Esta implementación de **`ValueObject<T>`** es un patrón estándar en **Domain-Driven Design (DDD)** para garantizar la **inmutabilidad** y la **igualdad estructural**. A diferencia de las `Entity` (que se comparan por ID), los `ValueObject` se comparan por el valor de sus atributos.

Aquí tienes un ejemplo completo de cómo modelar un **`Money`** (Dinero) y una **`Address`** (Dirección) utilizando esta clase base:

### 1. Ejemplo: `Money` (Valor Simple)
Representa una cantidad monetaria. Dos objetos `Money` son iguales si tienen la misma cantidad y moneda.

```typescript
// Money.ts
import { ValueObject } from './ValueObject.js';

interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  
  constructor(props: MoneyProps) {
    // Validaciones de dominio en el constructor
    if (props.amount < 0) throw new Error("El monto no puede ser negativo");
    super(props);
  }

  // Factory method
  public static create(amount: number, currency: string = 'USD'): Money {
    return new Money({ amount, currency });
  }

  // Implementación de la igualdad estructural
  protected getEqualityComponents(): unknown[] {
    // El orden importa: [amount, currency] debe ser consistente
    return [this.props.amount, this.props.currency];
  }

  // Métodos de comportamiento (lógica de dominio)
  public add(other: Money): Money {
    if (this.props.currency !== other.props.currency) {
      throw new Error("No se pueden sumar monedas diferentes");
    }
    return new Money({
      amount: this.props.amount + other.props.amount,
      currency: this.props.currency
    });
  }

  public getAmount(): number {
    return this.props.amount;
  }
}
```

### 2. Ejemplo: `Address` (Valor Compuesto)
Representa una dirección. La inmutabilidad es crucial aquí para evitar efectos secundarios al compartir direcciones entre entidades.

```typescript
// Address.ts
import { ValueObject } from './ValueObject.js';

interface AddressProps {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export class Address extends ValueObject<AddressProps> {
  
  constructor(props: AddressProps) {
    super(props);
  }

  public static create(street: string, city: string, zipCode: string, country: string): Address {
    return new Address({ street, city, zipCode, country });
  }

  protected getEqualityComponents(): unknown[] {
    return [
      this.props.street.toLowerCase(), // Normalización para comparación
      this.props.city.toLowerCase(),
      this.props.zipCode,
      this.props.country
    ];
  }

  // Devuelve una NUEVA instancia con cambios (patrón inmutable)
  public withCity(newCity: string): Address {
    return new Address({
      ...this.props,
      city: newCity
    });
  }
}
```

### 3. Uso y Comprobación de Igualdad

```typescript
const money1 = Money.create(100, 'USD');
const money2 = Money.create(100, 'USD');
const money3 = Money.create(200, 'USD');

console.log(money1.equals(money2)); // true (mismos valores)
console.log(money1.equals(money3)); // false (monto diferente)
// console.log(money1 === money2);  // false (referencias de memoria distintas)

const addr1 = Address.create("Calle 1", "Madrid", "28001", "España");
const addr2 = Address.create("Calle 1", "Madrid", "28001", "España");

console.log(addr1.equals(addr2)); // true
```

### Puntos Clave de la Implementación

1.  **Inmutabilidad Real**: Gracias a `Object.freeze` en la clase base y al patrón de devolver nuevas instancias (ej. `withCity`), los objetos no pueden modificarse accidentalmente una vez creados.
2.  **Igualdad Estructural**: El método `equals` compara los valores devueltos por `getEqualityComponents()`. Esto es más eficiente y seguro que usar `JSON.stringify`, ya que evita problemas con el orden de las claves y es más rápido en ejecución.
3.  **Normalización**: En `Address`, convertimos a minúsculas en los componentes de igualdad para que "Madrid" y "madrid" se consideren iguales, sin alterar los datos originales almacenados en `props`.
4.  **Seguridad de Tipos**: El genérico `T extends Record<string, any>` asegura que las propiedades sean siempre un objeto, previniendo usos incorrectos.

---

Esta clase `DomainEvent` es la base para implementar el patrón **Event Sourcing** o comunicación asíncrona en **Domain-Driven Design (DDD)**. Su función es capturar hechos pasados e inmutables que han ocurrido en el dominio.

Aquí tienes un ejemplo completo de cómo implementar un evento concreto, por ejemplo, `UsuarioRegistrado`:

### 1. Implementación del Evento Concreto

```typescript
// UsuarioRegistrado.ts
import { DomainEvent } from './DomainEvent.js';
import { UniqueId } from '../UniqueId.js';

// Opcional: Interfaz para los datos del evento (payload)
interface UsuarioRegistradoPayload {
  userId: string;
  email: string;
  nombre: string;
}

export class UsuarioRegistrado extends DomainEvent {
  // Los datos del evento deben ser públicos y de solo lectura (inmutables)
  public readonly userId: string;
  public readonly email: string;
  public readonly nombre: string;

  constructor(userId: string, email: string, nombre: string) {
    super(); // Inicializa eventId y dateTimeOccurred
    this.userId = userId;
    this.email = email;
    this.nombre = nombre;
  }

  // Implementación obligatoria: ID de la entidad que provocó el evento
  get aggregateId(): string {
    return this.userId;
  }
  
  // Opcional: Método para serializar el evento (útil para guardar en BD o enviar a cola)
  public toPrimitives(): Record<string, any> {
    return {
      eventId: this.eventId,
      aggregateId: this.aggregateId,
      eventType: this.eventType,
      occurredOn: this.dateTimeOccurred.toISOString(),
      data: {
        userId: this.userId,
        email: this.email,
        nombre: this.nombre
      }
    };
  }
}
```

### 2. Cómo se usa en el dominio

El evento se dispara dentro de la entidad o agregado cuando ocurre una acción relevante:

```typescript
// Dentro de tu clase Usuario (Entity)
public static crear(nombre: string, email: string): Usuario {
  const id = new UniqueId();
  const user = new Usuario({ nombre, email }, id);
  
  // Registrar el evento en la colección de eventos pendientes de la entidad
  user.recordEvent(new UsuarioRegistrado(id.toString(), email, nombre));
  
  return user;
}
```

### Puntos Clave del Diseño

1.  **Inmutabilidad**: Una vez creado el evento, sus datos (`userId`, `email`, etc.) y metadatos (`dateTimeOccurred`, `eventId`) no pueden cambiar. Esto es crucial para la auditoría y el replay de eventos.
2.  **`aggregateId`**: Este getter es fundamental. Permite a los **Event Bus** o procesadores de eventos saber a qué entidad pertenece el evento para agruparlos o asegurar el orden de procesamiento por agregado.
3.  **`eventType`**: Usar `this.constructor.name` es una convención útil para el enrutamiento dinámico. Permite que un "Listener" se suscriba a `"UsuarioRegistrado"` sin necesidad de importar la clase explícitamente en la configuración del bus.
4.  **Timestamp (`dateTimeOccurred`)**: Captura el momento exacto en que se instanció el evento, lo cual es vital para reconstruir el estado del sistema en un momento dado (Event Sourcing).


---

La clase `AggregateRoot<T>` que muestras es la pieza central para la **consistencia transaccional** y la **propagación de eventos** en DDD. Extiende `Entity<T>` para añadir la capacidad de acumular eventos de dominio (`DomainEvent`) que han ocurrido durante una transacción, pero que aún no han sido publicados a otros sistemas.

Aquí tienes un ejemplo completo integrando todas las piezas anteriores (`Entity`, `ValueObject`, `DomainEvent`, `AggregateRoot`) en un caso de uso real: **Crear un Usuario y publicar el evento**.

### Ejemplo Completo: `Usuario` como Aggregate Root

```typescript
// Usuario.ts
import { AggregateRoot } from './AggregateRoot.js';
import { UniqueId } from '../UniqueId.js';
import { UsuarioRegistrado } from './events/UsuarioRegistrado.js';
import { Email } from './value-objects/Email.js'; // Supongamos un VO Email

interface UsuarioProps {
  email: Email;
  nombre: string;
  esActivo: boolean;
}

export class Usuario extends AggregateRoot<UsuarioProps> {
  
  // Constructor privado para forzar el uso de factories o métodos estáticos
  private constructor(props: UsuarioProps, id?: UniqueId) {
    super(props, id);
  }

  // Factory Method: Crea la entidad y registra el evento inicial
  public static crear(emailStr: string, nombre: string): Usuario {
    const id = new UniqueId();
    const email = Email.create(emailStr); // Validación dentro del VO
    
    const user = new Usuario({
      email,
      nombre,
      esActivo: true
    }, id);

    // Registrar el evento de creación
    user.addDomainEvent(new UsuarioRegistrado(id.toString(), emailStr, nombre));
    
    return user;
  }

  // Método de dominio que genera otro evento
  public activar(): void {
    if (this.props.esActivo) {
      throw new Error("El usuario ya está activo");
    }
    
    // Modificación de estado (en un diseño inmutable estricto, esto retornaría una nueva instancia)
    // Para este ejemplo, asumimos mutación controlada interna o reasignación si tu Entity lo permite
    (this.props as any).esActivo = true;

    // Registrar evento de cambio de estado
    // this.addDomainEvent(new UsuarioActivado(this._id.toString()));
  }

  // Getters
  public getEmail(): string {
    return this.props.email.valor;
  }
  
  public getNombre(): string {
    return this.props.nombre;
  }
}
```

### Flujo de Uso en la Capa de Aplicación (Servicio/Controlador)

El `AggregateRoot` permite separar la lógica de negocio (qué pasó) de la infraestructura (cómo se publica el evento).

```typescript
// UsuarioService.ts
import { Usuario } from './domain/Usuario.js';
import { UsuarioRepository } from './infrastructure/UsuarioRepository.js';
import { EventBus } from './infrastructure/EventBus.js';

export class UsuarioService {
  constructor(
    private repo: UsuarioRepository,
    private eventBus: EventBus
  ) {}

  async registrarUsuario(email: string, nombre: string): Promise<void> {
    // 1. Crear el Aggregate Root (esto genera eventos internos)
    const usuario = Usuario.crear(email, nombre);

    // 2. Guardar el estado en la BD
    await this.repo.guardar(usuario);

    // 3. Obtener y publicar los eventos acumulados
    const eventos = usuario.domainEvents;
    
    if (eventos.length > 0) {
      await this.eventBus.publicar(eventos);
      
      // 4. Limpiar eventos después de publicar para evitar duplicados
      usuario.clearEvents();
    }
  }
}
```

### Por qué es importante esta estructura

1.  **Consistencia Transaccional**: Los eventos se guardan en memoria (`_domainEvents`) durante la transacción de base de datos. Solo se publican externamente si la transacción de guardado (`repo.guardar`) tiene éxito.
2.  **Desacoplamiento**: La entidad `Usuario` no sabe *cómo* se publica el evento (Kafka, RabbitMQ, base de datos), solo sabe *qué* ocurrió. Eso lo resuelve el `EventBus` en la capa de infraestructura.
3.  **Limpieza**: El método `clearEvents()` es vital. Si no se limpian los eventos después de publicarlos, se volverían a publicar en la siguiente operación sobre la misma instancia en memoria.
4.  **Inmutabilidad de Eventos**: Los eventos almacenados son objetos inmutables (`DomainEvent`), lo que garantiza que la información de lo que ocurrió no cambie aunque el estado de la entidad evolucione después.

---

Esta clase `Identifier<T>` es una implementación de **Value Object** tipado para encapsular la identidad de una entidad, evitando el uso de "primitivas desnudas" (como pasar un `string` o `number` directamente) y previniendo errores de tipo (ej. confundir el ID de un `Usuario` con el de un `Producto`).

Aquí tienes el ejemplo completo de cómo crear y usar una clase concreta `UserId` basada en tu `Identifier`:

### 1. Implementación Concreta (`UserId.ts`)

Se crea una clase específica que extiende `Identifier`, definiendo el tipo `T` (en este caso, `string` o `number`).

```typescript
// UserId.ts
import { Identifier } from './Identifier.js';

// Opción A: ID basado en string (ej. UUID)
export class UserId extends Identifier<string> {
  constructor(value: string) {
    // Validación opcional del formato UUID
    if (!value || typeof value !== 'string') {
      throw new Error("El ID de usuario debe ser un string válido");
    }
    super(value);
  }

  // Método estático factory común en DDD
  public static create(value: string): UserId {
    return new UserId(value);
  }
}

// Opción B: ID basado en número (ej. Auto-incremental DB)
/*
export class UserId extends Identifier<number> {
  constructor(value: number) {
    if (value <= 0) throw new Error("El ID debe ser positivo");
    super(value);
  }
}
*/
```

### 2. Integración con la Entidad (`Usuario.ts`)

Así es como se utiliza dentro de tu entidad `Usuario` (que extiende `Entity` o `AggregateRoot`), reemplazando el uso directo de `UniqueId` genérico por uno fuertemente tipado si así lo deseas, o usándolo como tipo para el ID.

```typescript
// Usuario.ts
import { AggregateRoot } from './AggregateRoot.js';
import { UserId } from './UserId.js'; // Tu nuevo identificador
import { UsuarioRegistrado } from './events/UsuarioRegistrado.js';

interface UsuarioProps {
  nombre: string;
  email: string;
}

export class Usuario extends AggregateRoot<UsuarioProps> {
  
  // Sobrescribimos el tipo de _id si la clase base lo permite, 
  // o simplemente usamos UserId en los métodos públicos.
  // En tu implementación anterior, _id era UniqueId. 
  // Para usar UserId, tu clase base Entity debería ser genérica también en el ID 
  // o UserId debería extender UniqueId. 
  
  // Asumiendo que UniqueId es otra implementación de Identifier<string>:
  // Si quieres que _id sea específicamente UserId, la clase Entity debería aceptar un genérico para el ID.
  // Pero dado tu código actual de Entity (que usa UniqueId fijo), 
  // lo común es que UniqueId SEA la implementación base y UserId la especialice.
  
  constructor(props: UsuarioProps, id: UserId) {
    // Si UniqueId no es padre de UserId, necesitarías adaptar el constructor de Entity.
    // Asumiremos que UserId extiende Identifier y Entity acepta Identifier<any> o similar.
    // Si tu Entity exige específicamente 'UniqueId', entonces UserId debe extender UniqueId.
    super(props, id as any); // Casting seguro si la jerarquía es compatible
  }

  public static crear(nombre: string, email: string): Usuario {
    const id = UserId.create(crypto.randomUUID());
    const user = new Usuario({ nombre, email }, id);
    
    user.addDomainEvent(new UsuarioRegistrado(id.getValue(), email, nombre));
    return user;
  }

  public getId(): UserId {
    // Retornamos el tipo específico, no el genérico
    return this._id as UserId;
  }
}
```

### 3. Beneficios Clave de este Patrón

1.  **Seguridad de Tipos (Type Safety)**:
    El compilador de TypeScript evitará que pases un `ProductId` donde se espera un `UserId`, aunque ambos sean internamente un `string`.
    ```typescript
    function buscarUsuario(id: UserId) { ... }
    
    const uId = new UserId("123");
    const pId = new ProductId("123");
    
    buscarUsuario(uId); // ✅ Correcto
    buscarUsuario(pId); // ❌ Error de compilación: Type 'ProductId' is not assignable to type 'UserId'.
    ```

2.  **Comparación Segura**:
    El método `equals` permite comparar IDs de forma segura sin preocuparse por el tipo interno (`string` vs `number`) o referencias de objeto.
    ```typescript
    const id1 = new UserId("abc");
    const id2 = new UserId("abc");
    const id3 = new UserId("xyz");

    id1.equals(id2); // true (mismo valor)
    id1.equals(id3); // false
    ```

3.  **Encapsulamiento**:
    La lógica de validación del formato del ID (ej. regex para UUID) vive dentro de la clase `UserId`, no dispersa en todo el código.

4.  **Jerarquía Flexible**:
    Al usar `Identifier<any>` en el método `equals`, permites comparar instancias de diferentes subclases (aunque lógicamente solo deberías comparar IDs del mismo tipo), manteniendo la flexibilidad del sistema de tipos.

---

Este código implementa el **Patrón Specification** (Especificación) en TypeScript, un patrón de diseño de DDD utilizado para encapsular reglas de negocio y criterios de selección de objetos de forma reutilizable y combinable.

### Concepto Clave
Una **Specification** es un predicado booleano (`isSatisfiedBy`) que determina si un objeto (`candidate`) cumple con un criterio específico. La potencia del patrón radica en su capacidad para **componer** reglas complejas a partir de reglas simples usando lógica booleana (`and`, `or`, `not`) sin ensuciar la lógica de dominio con condicionales `if/else` anidados.

### Ejemplo de Uso: Validación de Usuario

Imagina que necesitas validar si un usuario puede realizar una compra basada en varias reglas.

#### 1. Definición de Especificaciones Concretas

```typescript
// Usuario.ts
interface Usuario {
  edad: number;
  saldo: number;
  estaVerificado: boolean;
}

// Regla 1: Debe ser mayor de edad
class EsMayorDeEdad extends Specification<Usuario> {
  isSatisfiedBy(candidate: Usuario): boolean {
    return candidate.edad >= 18;
  }
}

// Regla 2: Debe tener saldo suficiente
class TieneSaldoSuficiente extends Specification<Usuario> {
  constructor(private montoRequerido: number) {
    super();
  }
  isSatisfiedBy(candidate: Usuario): boolean {
    return candidate.saldo >= this.montoRequerido;
  }
}

// Regla 3: Debe estar verificado
class EsUsuarioVerificado extends Specification<Usuario> {
  isSatisfiedBy(candidate: Usuario): boolean {
    return candidate.estaVerificado;
  }
}
```

#### 2. Composición de Reglas (El poder del patrón)

En lugar de escribir un `if` gigante, construyes la regla de negocio combinando las especificaciones:

```typescript
// Servicio o Caso de Uso
const usuario: Usuario = { edad: 20, saldo: 150, estaVerificado: true };
const montoCompra = 100;

// Regla compleja: (Mayor de edad Y Tiene saldo) Y (Está verificado)
const puedeComprar = new EsMayorDeEdad()
  .and(new TieneSaldoSuficiente(montoCompra))
  .and(new EsUsuarioVerificado());

// Regla alternativa: (Verificado O (Mayor de edad Y Saldo > 1000))
const puedeRetirar = new EsUsuarioVerificado()
  .or(new EsMayorDeEdad().and(new TieneSaldoSuficiente(1000)));

if (puedeComprar.isSatisfiedBy(usuario)) {
  console.log("Compra aprobada");
}

// Uso de NOT
const noEsMenorDeEdad = new EsMayorDeEdad().not();
```

### Ventajas de esta Implementación

1.  **Legibilidad**: El código lee casi como lenguaje natural (`esMayor.and(tieneSaldo)`).
2.  **Reutilización**: Las reglas simples (`EsMayorDeEdad`) se escriben una vez y se combinan en infinitos escenarios.
3.  **Testabilidad**: Cada especificación concreta es una clase pequeña y fácil de testear de forma aislada.
4.  **Mantenibilidad**: Si la regla de "mayoría de edad" cambia a 21 años, solo modificas la clase `EsMayorDeEdad` y se actualiza en todas las composiciones automáticamente.
5.  **Principio Open/Closed**: Puedes añadir nuevas reglas creando nuevas clases sin modificar las existentes ni la clase base `Specification`.

Este patrón es especialmente útil en **filtros de repositorios** (para generar queries dinámicos a la BD) y en **validaciones de dominio** complejas.

---


Este código implementa el patrón **Either** (también conocido como `Result`), fundamental en la **Programación Funcional** y muy utilizado en DDD con TypeScript para el **manejo de errores explícito** sin usar excepciones (`try/catch`).

### Concepto Clave
Representa un valor que puede ser una de dos cosas:
*   **`Left<L>`**: Convencionalmente representa el **error** o fallo (`L` = Left = Error).
*   **`Right<R>`**: Convencionalmente representa el **éxito** o valor correcto (`R` = Right = Correcto).

La regla mnemotécnica es: **"Left is Wrong, Right is Right"**.

### Ejemplo de Uso: Caso de Uso de Registro

En lugar de lanzar una excepción cuando algo falla, la función devuelve un `Left` con el error. Si tiene éxito, devuelve un `Right` con el resultado.

```typescript
// Definición de errores específicos
class EmailInvalidoError {
  readonly message = "El email no es válido";
}
class UsuarioYaExisteError {
  readonly message = "El usuario ya existe";
}

// Función de dominio que retorna Either
function registrarUsuario(email: string, existe: boolean): Either<EmailInvalidoError | UsuarioYaExisteError, string> {
  if (!email.includes('@')) {
    return left(new EmailInvalidoError()); // Retorna Left (Error)
  }
  if (existe) {
    return left(new UsuarioYaExisteError()); // Retorna Left (Error)
  }
  
  const idGenerado = "uuid-1234";
  return right(idGenerado); // Retorna Right (Éxito)
}

// Consumo del resultado
const resultado = registrarUsuario("test@test.com", false);

if (resultado.isLeft()) {
  // TypeScript sabe que aquí 'resultado' es Left y tiene el error
  console.error("Fallo:", resultado.value.message);
} else {
  // TypeScript sabe que aquí 'resultado' es Right y tiene el ID
  console.log("Éxito, ID:", resultado.value);
}
```

### Ventajas sobre `try/catch`

1.  **Errores como Datos**: Los errores son valores explícitos en la firma de la función (`Either<Error, T>`), lo que obliga al llamador a manejarlos. No hay errores "ocultos" o excepciones no capturadas.
2.  **Seguridad de Tipos (Type Guards)**: Los métodos `isLeft()` e `isRight()` usan **type predicates** (`this is Left...`). Esto permite que TypeScript reduzca el tipo automáticamente dentro de los bloques `if`, dándote acceso seguro a `value` sin necesidad de casts.
3.  **Flujo Controlado**: Evita la interrupción brusca del flujo de ejecución que provocan las excepciones, facilitando la composición de operaciones asíncronas o secuenciales.

Este patrón es la base para construcciones más avanzadas como `map`, `flatMap` (o `chain`) y `match`, que permiten transformar los valores de `Right` o `Left` sin desempaquetarlos manualmente.

---

Esta clase `Result<T>` es una implementación práctica del patrón **Result** (o *Result Object*), muy común en aplicaciones TypeScript/DDD para manejar errores de forma explícita y segura sin depender de excepciones (`try/catch`).

A diferencia del `Either` anterior, esta implementación es más concreta:
*   **Éxito (`ok`)**: Contiene un valor genérico `T` (o `undefined` si es una operación vacía).
*   **Fallo (`fail`)**: Contiene un mensaje de error de tipo `string` (menos flexible que `Either` que permite objetos de error tipados).
*   **Inmutabilidad**: `Object.freeze(this)` asegura que el resultado no cambie una vez creado.
*   **Seguridad**: Los métodos `getValue()` y `getErrorValue()` lanzan errores explícitos si se intenta acceder al estado incorrecto, actuando como una última línea de defensa.

### Ejemplo de Uso en un Caso de Uso

```typescript
interface LoginResponse { token: string; expiresIn: number; }

function iniciarSesion(credenciales: { user: string; pass: string }): Result<LoginResponse> {
  if (credenciales.pass !== "1234") {
    // Retornar fallo con mensaje descriptivo
    return Result.fail("Credenciales inválidas");
  }

  // Retornar éxito con datos
  return Result.ok({ token: "abc-123", expiresIn: 3600 });
}

// Consumo
const resultado = iniciarSesion({ user: "ana", pass: "wrong" });

if (resultado.isFailure) {
  console.error(resultado.getErrorValue()); // "Credenciales inválidas"
} else {
  const datos = resultado.getValue(); // Tipo seguro: LoginResponse
  console.log("Token:", datos.token);
}
```

### Diferencias clave con `Either`
| Característica | `Result<T>` (Tu código) | `Either<L, R>` |
| :--- | :--- | :--- |
| **Tipo de Error** | Fijo en `string` | Genérico `L` (puede ser una clase de error) |
| **Valor Éxito** | Genérico `T` | Genérico `R` |
| **Acceso a datos** | Lanza excepción si fallas | Requiere chequeo `isLeft/isRight` (más funcional) |
| **Uso ideal** | Casos de uso simples, mensajes de UI | Dominio rico, errores complejos tipados |

Esta clase es ideal para **capas de aplicación** donde necesitas retornar mensajes de error legibles para el usuario final o logs simples, manteniendo el flujo de control explícito.

---

Esta implementación de `UniqueId` es una especialización concreta y robusta de tu clase base `Identifier<T>`, diseñada para garantizar que **todos los identificadores del sistema sean UUIDs válidos** (versión 4).

### Puntos Clave de la Implementación

1.  **Validación Estricta**:
    *   Si se pasa un `id` explícito, usa `uuidValidate` para asegurar que cumple con el formato estándar antes de instanciar. Esto previene errores de integridad de datos al reconstruir entidades desde la base de datos o DTOs externos.
    *   Si no se pasa argumento, genera automáticamente un nuevo UUID v4 seguro usando `uuidv4()`.

2.  **Seguridad de Tipos**:
    *   Al extender `Identifier<string>`, hereda automáticamente los métodos `equals()`, `toString()` y `getValue()`, asegurando que cualquier `UniqueId` pueda compararse de forma segura con otros identificadores sin riesgo de confusión con otros tipos (como `ProductId` si este también extendiera `Identifier`).

3.  **Uso Típico en DDD**:
    *   Se utiliza como el tipo estándar para el `_id` en tus clases `Entity` y `AggregateRoot`.
    *   Al ser un Value Object inmutable (gracias a la clase base), garantiza que la identidad de una entidad nunca cambie durante su ciclo de vida.

### Ejemplo de Integración

```typescript
// Creación automática (nueva entidad)
const nuevoId = new UniqueId(); 
console.log(nuevoId.getValue()); // Ej: "550e8400-e29b-41d4-a716-446655440000"

// Reconstrucción desde BD (validación estricta)
const idExistente = new UniqueId("550e8400-e29b-41d4-a716-446655440000"); // ✅ OK

// Manejo de error explícito
try {
  const idInvalido = new UniqueId("no-es-un-uuid"); // ❌ Lanza Error
} catch (e) {
  console.error(e.message); // "El valor 'no-es-un-uuid' no es un UUID válido"
}

// Comparación heredada de Identifier
const id1 = new UniqueId();
const id2 = new UniqueId(id1.getValue());
console.log(id1.equals(id2)); // true
```

Esta clase cierra el ciclo de identidad en tu arquitectura: provee generación segura, validación de entrada y comparación tipada.


