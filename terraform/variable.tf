variable "region" {
  default = "us-east-1"
}

variable "cluster_name" {
  default = "SaaS_cluster_v2"
}

variable "node_type" {
  default = "t3.medium"
}

variable "node_count" {
  default = 2
}

variable "k8s_version" {
  default = "1.29"
}
