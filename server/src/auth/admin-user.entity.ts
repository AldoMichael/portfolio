import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Compte autorisé à modifier le contenu depuis l'interface d'administration. */
@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 180, unique: true })
  email: string;

  /** Empreinte scrypt : le mot de passe en clair n'est jamais stocké. */
  @Column('varchar', { length: 255, name: 'password_hash' })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
