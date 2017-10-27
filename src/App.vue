<template>
    <div class="row">

        <div class="col-md-12">
            <h2>Ma gestion personnelle de tickets</h2>
            <hr>
        </div>

        <transition name="fade">
            <div class="col-md-12" v-if="alerts.length != 0">
                <div class="alert alert-dismissible" role="alert" v-for="alert in alerts" :class="'alert-' + alert.type">
                    {{ alert.message }}
                    <hr v-if="confirmElement.show">
                    <button class="btn btn-default" v-if="confirmElement.show" @click.prevent="deleteTicket()">
                        Supprimer
                    </button>
                    <button type="button" class="btn btn-default" data-dismiss="alert" aria-label="Close" v-if="confirmElement.show" @click.prevent="cancel()">
                        Annuler
                    </button>
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close" v-if="!confirmElement.show">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            </div>
        </transition>

        <div :class="openTicket == null ? 'col-md-8' : 'col-md-12'">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <a href="#" @click.prevent="openTicket = null">Créer un nouveau ticket</a>
                </div>
                <transition name="fade">
                    <div class="panel-body" v-if="openTicket === null || openTicket.state === ''">
                        <div class="form-group">
                            <label for="ticketID">Identifiant du ticket (ID) * :</label>
                            <div class="input-group">
                                <span class="input-group-addon">#</span>
                                <input type="text" class="form-control" id="ticketID" placeholder="Ex: 8435" :disabled="newTicket.state != 'new'" v-model="newTicket.id">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="ticketName">Nom du ticket * :</label>
                            <input type="text" class="form-control" id="ticketName" placeholder="Ex: Mise en place du nouveau service" v-model="newTicket.name">
                        </div>
                        <div class="form-group">
                            <label for="ticketContent">Contenu / Synthèse du ticket :</label>
                            <textarea type="text" class="form-control" style="resize: vertical;" id="ticketContent" v-model="newTicket.content"></textarea>
                        </div>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" v-model="newTicket.markdown"> Convertir le contenu en Markdown
                            </label>
                        </div>
                        <button class="btn btn-default" v-if="newTicket.state === 'new'" @click.prevent="addTicket()">
                            Valider la création
                        </button>
                        <button class="btn btn-default" v-if="newTicket.state === ''" @click.prevent="editTicket()">
                            Editer le ticket
                        </button>
                        <button class="btn btn-default" @click.prevent="resetFields(true)">
                            Annuler
                        </button>
                    </div>
                </transition>
            </div>
        </div>

        <transition name="fade">
            <div class="col-md-8" v-if="openTicket != null">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        Ticket #{{ openTicket.id }} : {{ openTicket.name }}
                        <div class="pull-right">
                            <button class="btn btn-xs" @click.prevent="openTicket = null">Fermer</button>
                        </div>
                    </div>
                    <div class="panel-body">
                        <div v-if="!openTicket.markdown">
                            <span style="white-space: pre-line;">{{ openTicket.content }}</span>
                        </div>
                        <span v-if="openTicket.markdown" v-html="openTicket.content"></span>
                        <div v-if="openTicket.content === ''">
                            Aucun contenu mis en ligne..
                            <hr>
                            <button class="btn btn-default" @click.prevent="openTicket.state = ''; newTicket = openTicket">
                                Editer le ticket
                            </button>
                            <button class="btn btn-default" @click.prevent="addAlert('warning', 'Confirmez-vous la suppression du ticket #' + openTicket.id + ' ?', 7500); confirm(openTicket.id)">
                                Supprimer le ticket
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <div class="col-md-4">
            <div class="panel panel-default">
                <div class="panel-heading">Mes tickets</div>
                <div class="panel-body">
                    <div class="input-group" v-if="tickets.length != 0">
                        <input type="text" class="form-control" placeholder="Rechercher un ticket avec son ID..." v-model="query">
                        <span class="input-group-addon"><a href="#" @click.prevent="query = ''">&times;</a></span>
                    </div>
                    <hr v-if="tickets.length != 0">
                    <ul class="list-group">
                        <li class="list-group-item" v-for="(ticket, index) in computedTickets" :data-index="index" :class="openTicket === ticket ? 'disabled' : ''">
                            <a href="#" v-if="openTicket != ticket" @click.prevent="openTicket = ticket">
                                #{{ ticket.id }} (<span class="text-muted">{{ ticket.name }}</span>)
                            </a>
                            <span v-if="openTicket === ticket">
                                #{{ ticket.id }} (<span class="text-muted">{{ ticket.name }}</span>)
                            </span>
                        </li>
                        <li class="list-group-item" v-if="tickets.length === 0">
                            Aucun ticket ne semble disponible...
                        </li>
                        <li class="list-group-item" v-if="tickets.length != 0 && computedTickets.length === 0">
                            Aucun ticket ne correspond à votre recherche...
                        </li>
                    </ul>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    import marked from 'marked'

    export default {
        data () {
            return {
                newTicket: {
                    id: '8453',
                    name: 'Mise en place de l’authentification',
                    content: '',
                    markdown: false,
                    state: 'new'
                },
                tickets: [],
                openTicket: null,
                alerts: [],
                confirmElement: {
                    id: null,
                    show: false
                },
                query: '',
                serverAvailable: false
            }
        },
        mounted () {
            this.$http.get('http://localhost:3000').then(response => {
                this.tickets = response.body
                this.serverAvailable = true
            }, response => {
                this.addAlert('warning', 'Le serveur de sauvegarde est indisponible. Les nouveaux tickets ne seronts pas sauvegardés.', 7500)
            });
        },
        methods: {
            addTicket () {
                if (this.checkFields(this.newTicket.id) && this.checkFields(this.newTicket.name)) {
                    if (this.checkID(this.newTicket.id).length === 0) {
                        this.convertMarkdown()
                        this.tickets.push(this.newTicket)
                        this.openTicket = this.newTicket
                        if (this.serverAvailable) {
                            this.$http.post('http://localhost:3000/server/add', {
                                id: this.newTicket.id,
                                name: this.newTicket.name,
                                content: this.newTicket.content
                            }).then(response => {
                                this.addAlert('success', 'Nouveau ticket mis en place avec succès.', 7500)
                            }, response => {
                                this.addAlert('danger', 'Une erreur est survenue > ERR:SERVER', 7500)
                            });
                        } else {
                            this.addAlert('warning', 'Le serveur de sauvegarde est indisponible. Les données n\'ont pas été sauvegardées.', 7500)
                        }
                        this.resetFields(false)
                    } else {
                        this.addAlert('warning', 'Un ticket est déjà disponible pour cet idenfifiant : (#' + this.newTicket.id + ' > "' + this.newTicket.name + '")', 5000)
                    }
                } else {
                    this.addAlert('warning', 'Les champs ID et NOM doivent êtres renseignés.', 3000)
                }
            },
            editTicket () {
                this.convertMarkdown()
                let self = this
                this.tickets = this.tickets.map(function (ticket) {
                    if (ticket.id === self.newTicket.id) {
                        return self.newTicket
                    }
                    return ticket
                })
                this.resetFields(true)
            },
            deleteTicket () {
                let ticketID = this.confirmElement.id
                this.tickets = this.tickets.filter(function (ticket) {
                    return ticket.id != ticketID
                })
                this.openTicket = null
                this.cancel()
                this.alerts.shift()
                if (this.serverAvailable) {
                    this.$http.post('http://localhost:3000/server/delete', {
                        id: ticketID
                    }).then(response => {
                        this.addAlert('success', 'Suppression du ticket effectuée avec succès', 7500)
                    }, response => {
                        this.addAlert('danger', 'Une erreur est survenue > ERR:SERVER', 7500)
                    });
                } else {
                    this.addAlert('warning', 'Le serveur de sauvegarde est indisponible. Les données n\'ont pas été sauvegardées.', 7500)
                }
            },
            checkID (ticketID) {
                return this.tickets.filter(function (ticket) {
                    return ticket.id == ticketID
                })
            },
            checkFields (field) {
                return (field != null && field != '')
            },
            resetFields (resetOpenTicket) {
                this.newTicket = {
                    id: null,
                    name: null,
                    type: null,
                    content: '',
                    state: 'new'
                }
                if (resetOpenTicket === true) {
                    this.openTicket = null
                }
            },
            convertMarkdown () {
                if (this.newTicket.markdown) {
                    this.newTicket.content = marked(this.newTicket.content)
                }
            },
            confirm (ticketID) {
                this.confirmElement.id = ticketID
                this.confirmElement.show = true
            },
            cancel () {
                this.confirmElement.id = null
                this.confirmElement.show = false
            },
            addAlert(type, message, delay) {
                this.alerts.push({
                    type: type,
                    message: message
                })
                let self = this
                setTimeout(function () {
                    self.alerts.shift()
                }, delay)
            }
        },
        computed: {
            computedTickets: function () {
                var self = this
                return this.tickets.filter(function (ticket) {
                    return ticket.id.indexOf(self.query) !== -1
                })
            }
        }
    }
</script>

<style>
    .fade-enter-active, .fade-leave-active {
        transition: opacity .3s
    }

    .fade-enter, .fade-leave-to {
        opacity: 0
    }

    .bounce-enter-active {
        animation: bounce-in .5s;
    }

    .bounce-leave-active {
        animation: bounce-in .5s reverse;
    }

    @keyframes bounce-in {
        0% {
            transform: scale(0);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }
</style>